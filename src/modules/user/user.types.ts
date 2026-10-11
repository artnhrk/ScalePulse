import type { User } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';

import type { IRegisterBody } from '#modules/user/user.schema.js';

export interface IRegisterUserPageResponse {
    success: true;
    message: string;
    data: {
        username: string;
        email: string;
        page: string;
        count: number;
        source: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
}

export interface IGetUserByUsernameResponse {
    success: true;
    message: string;
    data: {
        username: string;
        createdAt: string;
        pages: {
            page: string;
            count: number;
            source: string | null;
            createdAt: string;
        }[];
    };
}

export interface IRegisterArgs {
    body: IRegisterBody;
    logger: FastifyBaseLogger;
}

export interface IRegisterNewPageArgs extends IRegisterArgs {
    user: User;
}

export interface IGetUserByUsernameArgs {
    params: { username: string };
    logger: FastifyBaseLogger;
}
