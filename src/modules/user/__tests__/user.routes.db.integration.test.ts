import type { Page } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import buildApp from '#app/app.js';
import prisma from '#infra/database/prisma.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { UserRepository } from '../user.repo.js';
import type { IRegisterResponseSchema } from '../user.schema.js';

type AppInstance = Awaited<ReturnType<typeof buildApp>>;

function assertDefined<T>(value: T | null | undefined): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error('Expected value to be defined');
    }
}

describe('POST /api/v1/user/register (Database Integration)', () => {
    let app: AppInstance;
    const userRepository = new UserRepository(prisma);

    beforeAll(async () => {
        app = await buildApp();
        await app.ready();
    });

    beforeEach(async () => {
        await prisma.page.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();
    });

    const payload = {
        username: 'test',
        email: 'test@example.com',
        page: 'portfolio',
        count: 10,
        source: 'github',
    };

    describe('When registering a new user', () => {
        it('should create the user and page in the database', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload,
            });

            expect(response.statusCode).toBe(201);

            const result = response.json<IRegisterResponseSchema>();
            expect(result).toMatchObject({
                username: payload.username,
                email: payload.email,
                page: payload.page,
                count: payload.count,
                source: payload.source,
            });

            const user = await userRepository.findUserByUsername(payload.username);
            assertDefined(user);

            expect(user).toMatchObject({
                username: payload.username,
                email: payload.email,
            });

            const page = await userRepository.findPageByUserId({
                userId: user.id,
                slug: payload.page,
            });

            assertDefined(page);
            expect(page).toMatchObject({
                slug: payload.page,
                userId: user.id,
                isSeeded: true,
                count: payload.count,
                source: payload.source,
                seededAt: expect.any(Date) as Date,
            });
        });
    });

    describe('When the email already belongs to another username', () => {
        it('should return 409 and not create anything', async () => {
            await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    username: 'other-username',
                    email: payload.email,
                },
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload,
            });

            expect(response.statusCode).toBe(StatusCode.CONFLICT);
            expect(response.json()).toMatchObject({
                error: {
                    code: 'CONFLICT',
                    message: 'Username registered with different email',
                },
            });

            const users = await prisma.user.findMany();
            const pages = await prisma.page.findMany();

            expect(users).toHaveLength(1);
            expect(pages).toHaveLength(0);
        });
    });

    describe('When the username already belongs to another email', () => {
        it('should return 409 and not create anything', async () => {
            await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    username: payload.username,
                    email: 'another@example.com',
                },
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload,
            });

            expect(response.statusCode).toBe(StatusCode.CONFLICT);

            const users = await prisma.user.findMany();
            const pages = await prisma.page.findMany();

            expect(users).toHaveLength(1);
            expect(pages).toHaveLength(0);
        });
    });

    describe('When the user already has the requested page', () => {
        it('should return 409 and not create another page', async () => {
            const user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    username: payload.username,
                    email: payload.email,
                },
            });

            await prisma.page.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    slug: 'portfolio',
                    count: 10,
                    source: 'github',
                    isSeeded: true,
                    seededAt: new Date(),
                },
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: {
                    ...payload,
                    count: 69,
                },
            });

            expect(response.statusCode).toBe(StatusCode.CONFLICT);

            const users = await prisma.user.findMany();
            const pages = await prisma.page.findMany();

            expect(users).toHaveLength(1);
            expect(pages).toHaveLength(1);

            // it should be 10 (the initial count) not 69 (the updated count) becuase page is not created
            expect((pages[0] as Page).count).toBe(10);
        });
    });

    describe('When the user exists but the page does not', () => {
        it('should create only the new page for the existing user', async () => {
            const user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    username: payload.username,
                    email: payload.email,
                },
            });

            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload,
            });

            expect(response.statusCode).toBe(StatusCode.CREATED);

            const result = response.json<IRegisterResponseSchema>();

            expect(result).toMatchObject({
                username: payload.username,
                email: payload.email,
                page: payload.page,
                count: payload.count,
                source: payload.source,
            });

            const users = await prisma.user.findMany();
            const pages = await prisma.page.findMany();

            expect(users).toHaveLength(1);
            expect(users[0]?.id).toBe(user.id);

            expect(pages).toHaveLength(1);
            const createdPage = pages[0];
            assertDefined(createdPage);
            expect(createdPage).toMatchObject({
                slug: payload.page,
                userId: user.id,
                count: payload.count,
                source: payload.source,
                isSeeded: true,
                seededAt: expect.any(Date) as Date,
            });
        });
    });
});
