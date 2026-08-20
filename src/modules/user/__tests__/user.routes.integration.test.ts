import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import buildApp from '#app/app.js';
import type { UserRepository } from '#modules/user/user.repo.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

type AppInstance = Awaited<ReturnType<typeof buildApp>>;

const findUserByEmailMock = vi.fn();
const findUserByUsernameMock = vi.fn();
const findPageByUserIdMock = vi.fn();
const registerMock = vi.fn();
const registerPageMock = vi.fn();

const UserRepositoryMock = {
    findUserByEmail: findUserByEmailMock,
    findUserByUsername: findUserByUsernameMock,
    findPageByUserId: findPageByUserIdMock,
    registerPage: registerPageMock,
    register: registerMock,
} as unknown as UserRepository;

describe('User Routes (Integration)', () => {
    let app: AppInstance;

    beforeAll(async () => {
        app = await buildApp({ userRepository: UserRepositoryMock });
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    const validPayload = {
        username: 'test',
        email: 'test@example.com',
        page: 'dummy-page',
        count: 10,
        source: 'dummy-source',
    };

    const user = {
        id: 'dummy-user-id',
        username: 'test',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const page = {
        id: 'dummy-page-id',
        userId: 'dummy-user-id',
        slug: 'dummy-page',
        count: 10,
        source: 'dummy-source',
        isSeeded: true,
        seededAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    describe('POST /register', () => {
        it('should return 201 and register a new user', async () => {
            findUserByEmailMock.mockResolvedValue(null);
            findUserByUsernameMock.mockResolvedValue(null);
            registerMock.mockResolvedValue({ user, page });

            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: validPayload,
            });

            expect(res.statusCode).toBe(StatusCode.CREATED);
            expect(res.json()).toEqual({
                username: user.username,
                email: user.email,
                page: page.slug,
                count: page.count,
                source: page.source,
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(validPayload.email);

            expect(findUserByUsernameMock).toHaveBeenCalledOnce();
            expect(findUserByUsernameMock).toHaveBeenCalledWith(validPayload.username);

            expect(registerMock).toHaveBeenCalledOnce();
            expect(registerMock).toHaveBeenCalledWith({
                username: validPayload.username,
                email: validPayload.email,
                page: validPayload.page,
                count: validPayload.count,
                source: validPayload.source,
                isSeeded: true,
                seededAt: expect.any(Date) as Date,
            });
        });

        it('should return 409 when username is taken with a different email', async () => {
            findUserByEmailMock.mockResolvedValue(null);
            findUserByUsernameMock.mockResolvedValue(user);

            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: validPayload,
            });

            expect(res.statusCode).toBe(StatusCode.CONFLICT);
            expect(res.json()).toMatchObject({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Username registered with different email',
                },
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(validPayload.email);

            expect(findUserByUsernameMock).toHaveBeenCalledOnce();
            expect(findUserByUsernameMock).toHaveBeenCalledWith(validPayload.username);

            expect(registerMock).not.toHaveBeenCalled();
        });

        it('should return 409 when email is used with a different username', async () => {
            findUserByEmailMock.mockResolvedValue({
                ...user,
                username: 'other-username',
            });

            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: validPayload,
            });

            expect(res.statusCode).toBe(StatusCode.CONFLICT);
            expect(res.json()).toMatchObject({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Username registered with different email',
                },
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(validPayload.email);

            expect(findUserByUsernameMock).not.toHaveBeenCalledOnce();

            expect(registerMock).not.toHaveBeenCalled();
        });

        it('should return 409 when the page already exists for the user', async () => {
            findUserByEmailMock.mockResolvedValue(user);
            findPageByUserIdMock.mockResolvedValue(page);

            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: validPayload,
            });

            expect(res.statusCode).toBe(StatusCode.CONFLICT);
            expect(res.json()).toMatchObject({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Page already exists with given username',
                },
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(validPayload.email);

            expect(findUserByUsernameMock).not.toHaveBeenCalledOnce();

            expect(findPageByUserIdMock).toHaveBeenCalledOnce();
            expect(findPageByUserIdMock).toHaveBeenCalledWith({
                userId: user.id,
                slug: validPayload.page,
            });

            expect(registerMock).not.toHaveBeenCalled();
        });

        it('should return 400 when the body fails validation', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: {
                    username: 'test',
                    email: 'not-an-email',
                    page: 'dummy-page',
                },
            });

            expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
            expect(res.json()).toMatchObject({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                },
            });

            expect(findUserByEmailMock).not.toHaveBeenCalled();
            expect(findUserByUsernameMock).not.toHaveBeenCalled();
            expect(findPageByUserIdMock).not.toHaveBeenCalled();
            expect(registerMock).not.toHaveBeenCalled();
        });

        it('should return 400 when the body contains unknown properties', async () => {
            const res = await app.inject({
                method: 'POST',
                url: '/api/v1/user/register',
                payload: {
                    ...validPayload,
                    extra: 'nope',
                },
            });

            expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
            expect(res.json()).toMatchObject({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                },
            });

            expect(findUserByEmailMock).not.toHaveBeenCalled();
            expect(findUserByUsernameMock).not.toHaveBeenCalled();
            expect(findPageByUserIdMock).not.toHaveBeenCalled();
            expect(registerMock).not.toHaveBeenCalled();
        });
    });
});
