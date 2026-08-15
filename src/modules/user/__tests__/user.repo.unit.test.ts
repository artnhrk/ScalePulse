import type { Page, Prisma, PrismaClient } from '@prisma/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { randomUuid } from '#shared/utils/randomUuid.utils.js';

import { type IRegisterPageParams, UserRepository } from '../user.repo.js';

// mock randomUuid to return a fixed value
const { randomUuidMock } = vi.hoisted(() => ({
    randomUuidMock: vi.fn().mockReturnValue('page-1'),
}));

vi.mock('#shared/utils/randomUuid.utils.js', () => ({
    randomUuid: randomUuidMock,
}));

// Mock all Prisma methods used inside UserRepository.
const userFindUniqueMock = vi.fn();
const pageFindUniqueMock = vi.fn();
const PageFindManyMock = vi.fn();
const pageCreateMock = vi.fn();
const userCreateMock = vi.fn();
const transactionMock = vi.fn();

const prismaMock = {
    user: {
        findUnique: userFindUniqueMock,
        create: userCreateMock,
    },
    page: {
        findUnique: pageFindUniqueMock,
        findMany: PageFindManyMock,
        create: pageCreateMock,
    },
    $transaction: transactionMock,
} as unknown as PrismaClient;

describe('User Repository (unit)', () => {
    const userRepo = new UserRepository(prismaMock);

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findUserByEmail()', () => {
        it('should find a user by email', async () => {
            const email = 'test@scalepulse.com';
            const user = {
                id: 'dummy-unique-user-id',
                username: 'test',
                email,
            };

            userFindUniqueMock.mockResolvedValue(user);

            const result = await userRepo.findUserByEmail(email);

            expect(result).toEqual(user);
            expect(userFindUniqueMock).toHaveBeenCalledOnce();
            expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { email } });
        });

        it('should return null if no user is found', async () => {
            const email = 'nonexistent@scalepulse.com';
            const user = null;

            userFindUniqueMock.mockResolvedValue(user);

            const result = await userRepo.findUserByEmail(email);

            expect(result).toBeNull();
            expect(userFindUniqueMock).toHaveBeenCalledOnce();
            expect(userFindUniqueMock).toHaveBeenCalledWith({
                where: { email: 'nonexistent@scalepulse.com' },
            });
        });
    });

    describe('findUserByUsername()', () => {
        it('should find a user by username', async () => {
            const username = 'test';
            const user = {
                id: 'dummy-unique-user-id',
                username,
                email: 'test@scalepulse.com',
            };

            userFindUniqueMock.mockResolvedValue(user);

            const result = await userRepo.findUserByUsername(username);

            expect(result).toEqual(user);
            expect(userFindUniqueMock).toHaveBeenCalledOnce();
            expect(userFindUniqueMock).toHaveBeenCalledWith({ where: { username } });
        });

        it('should return null if no user is found', async () => {
            const username = 'nonexistent';
            const user = null;

            userFindUniqueMock.mockResolvedValue(user);

            const result = await userRepo.findUserByUsername(username);

            expect(result).toBeNull();
            expect(userFindUniqueMock).toHaveBeenCalledOnce();
            expect(userFindUniqueMock).toHaveBeenCalledWith({
                where: { username: 'nonexistent' },
            });
        });
    });

    describe('findPageByUserId()', () => {
        it('should find a page of user by user id', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';

            const page = {
                id: 'dummy-id',
                slug,
                userId,
                count: 10,
                isSeeded: false,
                seededAt: null,
                source: '',
            };

            pageFindUniqueMock.mockResolvedValue(page);

            const result = await userRepo.findPageByUserId({ userId, slug });

            expect(result).toEqual(page);
            expect(pageFindUniqueMock).toHaveBeenCalledOnce();
            expect(pageFindUniqueMock).toHaveBeenCalledWith({
                where: { userId_slug: { userId, slug } },
            });
        });

        it('should return null if no page is found', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';
            const page = null;

            pageFindUniqueMock.mockResolvedValue(page);

            const result = await userRepo.findPageByUserId({ userId, slug });

            expect(result).toBeNull();
            expect(pageFindUniqueMock).toHaveBeenCalledOnce();
            expect(pageFindUniqueMock).toHaveBeenCalledWith({
                where: { userId_slug: { userId, slug } },
            });
        });
    });

    describe('getAllPages()', () => {
        it('should return all pages for a user', async () => {
            const userId = 'dummy-user-id';
            const pages = [
                {
                    id: 'page-1',
                    slug: 'slug-1',
                    userId,
                    count: 10,
                    isSeeded: false,
                    seededAt: null,
                    source: '',
                },
                {
                    id: 'page-2',
                    slug: 'slug-2',
                    userId,
                    count: 20,
                    isSeeded: false,
                    seededAt: null,
                    source: '',
                },
            ];

            PageFindManyMock.mockResolvedValue(pages);

            const result = await userRepo.getAllPages({ userId });

            expect(result).toEqual(pages);
            expect(PageFindManyMock).toHaveBeenCalledOnce();
            expect(PageFindManyMock).toHaveBeenCalledWith({ where: { userId } });
        });

        it('should return an empty array if no pages are found', async () => {
            const userId = 'dummy-user-id';
            const pages: Page[] = [];

            PageFindManyMock.mockResolvedValue(pages);

            const result = await userRepo.getAllPages({ userId });

            expect(result).toEqual(pages);
            expect(PageFindManyMock).toHaveBeenCalledOnce();
            expect(PageFindManyMock).toHaveBeenCalledWith({ where: { userId } });
        });
    });

    describe('registerPage()', () => {
        const fixedPageId = randomUuid();

        it('should register a page for a user', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';
            const params: IRegisterPageParams = {
                page: slug,
                userId,
                count: 0,
                isSeeded: false,
                seededAt: null,
                source: '',
            };

            const response = {
                id: fixedPageId,
                userId,
                slug,
                count: 0,
                isSeeded: false,
                seededAt: null,
                source: '',
            };

            pageCreateMock.mockResolvedValue(response);

            const result = await userRepo.registerPage({ params });

            expect(result).toEqual(response);
            expect(pageCreateMock).toHaveBeenCalledOnce();
            expect(pageCreateMock).toHaveBeenCalledWith({ data: response });
        });

        it('should omit optional fields when they are undefined', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';
            const params: IRegisterPageParams = {
                page: slug,
                userId,
            };
            const response = {
                id: fixedPageId,
                userId,
                slug,
                count: 0,
                isSeeded: false,
                seededAt: null,
                source: '',
            };

            pageCreateMock.mockResolvedValue(response);

            await userRepo.registerPage({ params });

            expect(pageCreateMock).toHaveBeenCalledWith({
                data: {
                    id: fixedPageId,
                    userId,
                    slug,
                },
            });
        });

        it('should use the provided database client', async () => {
            const transactionPageCreateMock = vi.fn();
            const transactionDb = {
                page: {
                    create: transactionPageCreateMock,
                },
            } as unknown as Prisma.TransactionClient;

            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';

            transactionPageCreateMock.mockResolvedValue({
                id: fixedPageId,
                slug,
                userId,
            });

            await userRepo.registerPage({
                db: transactionDb,
                params: {
                    page: slug,
                    userId,
                },
            });

            expect(transactionPageCreateMock).toHaveBeenCalledOnce();
            expect(transactionPageCreateMock).toHaveBeenCalledWith({
                data: {
                    id: fixedPageId,
                    slug,
                    userId,
                },
            });
        });
    });

    describe('register()', () => {
        it('should register a new user and page in a transaction', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';

            const user = {
                id: userId,
                username: 'test',
                email: 'test@scalepulse.com',
            };
            const page = {
                id: 'page-1',
                slug,
                userId,
                count: 10,
                isSeeded: true,
                seededAt: new Date('2026-08-14T00:00:00.000Z'),
                source: 'github',
            };

            randomUuidMock.mockReturnValueOnce('user-1').mockReturnValueOnce('page-1');
            userCreateMock.mockResolvedValue(user);
            pageCreateMock.mockResolvedValue(page);

            transactionMock.mockImplementationOnce(
                async (callback: (tx: PrismaClient) => Promise<void>) =>
                    callback(prismaMock),
            );

            const result = await userRepo.register({
                username: user.username,
                page: page.slug,
                email: user.email,
                count: page.count,
                isSeeded: page.isSeeded,
                seededAt: page.seededAt,
                source: page.source,
            });

            expect(result).toEqual({
                user,
                page,
            });

            expect(transactionMock).toHaveBeenCalledOnce();

            expect(userCreateMock).toHaveBeenCalledOnce();
            expect(userCreateMock).toHaveBeenCalledWith({
                data: {
                    id: 'user-1',
                    username: user.username,
                    email: user.email,
                },
            });
            expect(pageCreateMock).toHaveBeenCalledOnce();
            expect(pageCreateMock).toHaveBeenCalledWith({
                data: {
                    id: 'page-1',
                    slug: page.slug,
                    userId: user.id,
                    count: page.count,
                    isSeeded: page.isSeeded,
                    seededAt: page.seededAt,
                    source: page.source,
                },
            });
        });

        it('should propagate an error if page creation fails', async () => {
            const userId = 'dummy-user-id';
            const slug = 'dummy-slug';
            const error = new Error('Failed to create page');

            userCreateMock.mockResolvedValue({
                id: userId,
                username: 'test',
                email: 'test@scalepulse.com',
            });

            pageCreateMock.mockRejectedValue(error);

            transactionMock.mockImplementation(
                async (callback: (tx: PrismaClient) => Promise<void>) =>
                    callback(prismaMock),
            );

            await expect(
                userRepo.register({
                    username: 'test',
                    page: slug,
                    email: 'test@scalepulse.com',
                }),
            ).rejects.toThrow(error);

            expect(transactionMock).toHaveBeenCalledOnce();
        });
    });
});
