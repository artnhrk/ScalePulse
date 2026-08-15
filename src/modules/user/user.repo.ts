import type { Prisma, PrismaClient } from '@prisma/client';

import { randomUuid } from '#shared/utils/randomUuid.utils.js';

import type { IRegisterBody } from './user.schema.js';

export interface IRegisterUserParams extends IRegisterBody {
    isSeeded?: boolean;
    seededAt?: Date | null;
}

export interface IRegisterPageParams {
    page: string;
    userId: string;
    count?: number | undefined;
    isSeeded?: boolean | undefined;
    seededAt?: Date | null | undefined;
    source?: string | undefined;
}

export interface IRegisterPage {
    db?: IPrismaExecutor;
    params: IRegisterPageParams;
}

export type IPrismaExecutor = PrismaClient | Prisma.TransactionClient;

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findUserByUsername(username: string) {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findPageByUserId({ userId, slug }: { userId: string; slug: string }) {
        return this.prisma.page.findUnique({ where: { userId_slug: { userId, slug } } });
    }

    async getAllPages({ userId }: { userId: string }) {
        return this.prisma.page.findMany({ where: { userId } });
    }

    async registerPage({ db = this.prisma, params }: IRegisterPage) {
        const { page, userId, count, isSeeded, seededAt, source } = params;
        return db.page.create({
            data: {
                id: randomUuid(),
                slug: page,
                userId,
                ...(count !== undefined ? { count } : {}),
                ...(isSeeded !== undefined ? { isSeeded } : {}),
                ...(seededAt !== undefined ? { seededAt } : {}),
                ...(source !== undefined ? { source } : {}),
            },
        });
    }

    // create resource in the database to refer the username and page registration
    async register({
        username,
        page,
        email,
        count,
        source,
        isSeeded,
        seededAt,
    }: IRegisterUserParams) {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    id: randomUuid(),
                    username,
                    email,
                },
            });

            const params = {
                page,
                userId: user.id,
                count,
                isSeeded,
                seededAt,
                source,
            };

            const createdPage = await this.registerPage({ db: tx, params });

            return {
                user,
                page: createdPage,
            };
        });
    }
}
