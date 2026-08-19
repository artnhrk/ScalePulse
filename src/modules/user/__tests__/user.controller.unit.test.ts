import type { Page, User } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import UserController from '#modules/user/user.controller.js';
import type { UserRepository } from '#modules/user/user.repo.js';
import type { IRegisterBody } from '#modules/user/user.schema.js';

const findUserByEmailMock = vi.fn();
const findUserByUsernameMock = vi.fn();
const findPageByUserIdMock = vi.fn();
const registerMock = vi.fn();
const registerPageMock = vi.fn();

const loggerMock = {
    info: vi.fn(),
    error: vi.fn(),
} as unknown as FastifyBaseLogger;

const UserRepositoryMock = {
    findUserByEmail: findUserByEmailMock,
    findUserByUsername: findUserByUsernameMock,
    findPageByUserId: findPageByUserIdMock,
    registerPage: registerPageMock,
    register: registerMock,
} as unknown as UserRepository;

describe('UserController (unit)', () => {
    const userController = new UserController(UserRepositoryMock);

    afterEach(() => {
        vi.resetAllMocks();
    });

    const testData = {
        username: 'test',
        email: 'test@example.com',
        page: 'dummy-page',
        pageId: 'dummy-page-id',
        userId: 'dummy-user-id',
        source: 'dummy-source',
    };

    type UserFixture = Pick<
        User,
        'id' | 'username' | 'email' | 'createdAt' | 'updatedAt'
    >;
    type PageFixture = Pick<
        Page,
        | 'id'
        | 'userId'
        | 'slug'
        | 'count'
        | 'isSeeded'
        | 'seededAt'
        | 'source'
        | 'createdAt'
        | 'updatedAt'
    >;

    const makeBody = (overrides: Partial<IRegisterBody> = {}): IRegisterBody => ({
        username: testData.username,
        email: testData.email,
        page: testData.page,
        count: 10,
        source: testData.source,
        ...overrides,
    });

    const makeUser = (overrides: Partial<UserFixture> = {}): UserFixture => ({
        id: testData.userId,
        username: testData.username,
        email: testData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });

    const makePage = (overrides: Partial<PageFixture> = {}): PageFixture => ({
        id: testData.pageId,
        userId: testData.userId,
        slug: testData.page,
        count: 10,
        source: testData.source,
        isSeeded: true,
        seededAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });

    describe('registerNewUser()', () => {
        it('should register a new user and return the created resource', async () => {
            const body = makeBody();
            const user = makeUser();
            const page = makePage();
            registerMock.mockResolvedValue({
                user,
                page,
            });

            const result = await userController.registerNewUser({
                body,
                logger: loggerMock,
            });
            expect(registerMock).toHaveBeenCalledOnce();
            expect(result).toEqual({
                username: user.username,
                email: user.email,
                page: page.slug,
                count: page.count,
                source: page.source,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        });

        it('should use zero count and mark the page as not seeded when count is not provided', async () => {
            const body = {
                username: testData.username,
                email: testData.email,
                page: testData.page,
            };
            const user = makeUser();
            const page = makePage({
                count: 0,
                source: null,
                isSeeded: false,
                seededAt: null,
            });

            registerMock.mockResolvedValue({
                user,
                page,
            });

            const result = await userController.registerNewUser({
                body,
                logger: loggerMock,
            });
            expect(registerMock).toHaveBeenCalledOnce();
            expect(registerMock).toHaveBeenCalledWith({
                username: testData.username,
                email: testData.email,
                page: testData.page,
                count: 0,
                isSeeded: false,
                seededAt: null,
            });
            expect(result.count).toBe(0);
            expect(result.source).toBeNull();
        });
    });

    describe('registerNewPage()', () => {
        it('should register a new page for an existing user', async () => {
            const body = makeBody();
            const user = makeUser();
            const createdPage = makePage();

            registerPageMock.mockResolvedValue(createdPage);
            const result = await userController.registerNewPage({
                body,
                logger: loggerMock,
                user,
            });

            expect(registerPageMock).toHaveBeenCalledOnce();
            expect(registerPageMock).toHaveBeenCalledWith({
                params: {
                    userId: testData.userId,
                    page: testData.page,
                    count: createdPage.count,
                    source: createdPage.source,
                    isSeeded: createdPage.isSeeded,
                    seededAt: createdPage.seededAt,
                },
            });
            expect(result).toEqual({
                username: user.username,
                email: user.email,
                page: createdPage.slug,
                count: createdPage.count,
                source: createdPage.source,
                createdAt: createdPage.createdAt,
                updatedAt: createdPage.updatedAt,
            });
        });

        it('should use zero count and mark the page as not seeded when count is not provided', async () => {
            const body = {
                username: testData.username,
                email: testData.email,
                page: testData.page,
            };
            const user = makeUser();
            const createdPage = makePage({
                count: 0,
                isSeeded: false,
                seededAt: null,
                source: null,
            });

            registerPageMock.mockResolvedValue(createdPage);
            const result = await userController.registerNewPage({
                body,
                logger: loggerMock,
                user,
            });

            expect(registerPageMock).toHaveBeenCalledOnce();
            expect(registerPageMock).toHaveBeenCalledWith({
                params: {
                    userId: testData.userId,
                    page: testData.page,
                    count: 0,
                    isSeeded: false,
                    seededAt: null,
                },
            });
            expect(result).toEqual({
                username: user.username,
                email: user.email,
                page: createdPage.slug,
                count: createdPage.count,
                source: createdPage.source,
                createdAt: createdPage.createdAt,
                updatedAt: createdPage.updatedAt,
            });
        });
    });

    describe('register()', () => {
        const body = makeBody();
        const user = makeUser();
        const page = makePage();

        it('should register a new user when email and username do not exist', async () => {
            findUserByEmailMock.mockResolvedValue(null);
            findUserByUsernameMock.mockResolvedValue(null);
            registerMock.mockResolvedValue({ user, page });

            const result = await userController.register({ body, logger: loggerMock });

            expect(result).toEqual({
                username: testData.username,
                email: testData.email,
                page: testData.page,
                count: body.count,
                source: body.source,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(body.email);
            expect(findUserByUsernameMock).toHaveBeenCalledOnce();
            expect(findUserByUsernameMock).toHaveBeenCalledWith(body.username);

            expect(registerMock).toHaveBeenCalledOnce();
            expect(registerMock).toHaveBeenCalledWith({
                username: body.username,
                email: body.email,
                page: body.page,
                count: body.count,
                source: body.source,
                isSeeded: true,
                seededAt: expect.any(Date) as Date,
            });
        });
        it('should register a new page when email and username exist and matches with the given user', async () => {
            findUserByEmailMock.mockResolvedValue(user);
            findPageByUserIdMock.mockResolvedValue(null);
            registerPageMock.mockResolvedValue(page);

            const result = await userController.register({ body, logger: loggerMock });
            expect(result).toEqual({
                username: testData.username,
                email: testData.email,
                page: testData.page,
                count: body.count,
                source: body.source,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(body.email);

            expect(findUserByUsernameMock).not.toHaveBeenCalled();

            expect(findPageByUserIdMock).toHaveBeenCalledOnce();
            expect(findPageByUserIdMock).toHaveBeenCalledWith({
                userId: user.id,
                slug: body.page,
            });
            expect(registerPageMock).toHaveBeenCalledOnce();
            expect(registerPageMock).toHaveBeenCalledWith({
                params: {
                    userId: user.id,
                    page: body.page,
                    count: body.count,
                    source: body.source,
                    isSeeded: true,
                    seededAt: expect.any(Date) as Date,
                },
            });
        });
        it('should throw a conflict error when username already exist with a different email', async () => {
            const differentEmail = 'different@example.com';
            const updatedBody = {
                ...body,
                email: differentEmail,
            };
            findUserByEmailMock.mockResolvedValueOnce(null);
            findUserByUsernameMock.mockResolvedValueOnce(user);

            await expect(
                userController.register({
                    body: updatedBody,
                    logger: loggerMock,
                }),
            ).rejects.toMatchObject({
                message: 'Username registered with different email',
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(differentEmail);
            expect(findUserByUsernameMock).toHaveBeenCalledOnce();
            expect(findUserByUsernameMock).toHaveBeenCalledWith(testData.username);

            expect(registerMock).not.toHaveBeenCalled();
            expect(registerPageMock).not.toHaveBeenCalled();
        });
        it('should throw a conflict error when email exist with a different username', async () => {
            const differentUsername = 'differentusername';
            const updatedBody = {
                ...body,
                username: differentUsername,
            };
            findUserByEmailMock.mockResolvedValueOnce(user);

            await expect(
                userController.register({
                    body: updatedBody,
                    logger: loggerMock,
                }),
            ).rejects.toMatchObject({
                message: 'Username registered with different email',
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(testData.email);
            expect(findUserByUsernameMock).not.toHaveBeenCalled();
            expect(registerMock).not.toHaveBeenCalled();
            expect(registerPageMock).not.toHaveBeenCalled();
        });
        it('should throw a conflict error when page already exist for the user', async () => {
            findUserByEmailMock.mockResolvedValueOnce(user);
            findPageByUserIdMock.mockResolvedValueOnce(page);

            await expect(
                userController.register({
                    body,
                    logger: loggerMock,
                }),
            ).rejects.toMatchObject({
                message: 'Page already exists with given username',
            });

            expect(findUserByEmailMock).toHaveBeenCalledOnce();
            expect(findUserByEmailMock).toHaveBeenCalledWith(testData.email);

            expect(findUserByUsernameMock).not.toHaveBeenCalled();

            expect(findPageByUserIdMock).toHaveBeenCalledOnce();
            expect(findPageByUserIdMock).toHaveBeenCalledWith({
                userId: user.id,
                slug: page.slug,
            });

            expect(registerMock).not.toHaveBeenCalled();
            expect(registerPageMock).not.toHaveBeenCalled();
        });
    });
});
