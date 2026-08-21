import type { User } from '@prisma/client';
import type { FastifyBaseLogger } from 'fastify';

import type { UserRepository } from '#modules/user/user.repo.js';
import type { IRegisterBody } from '#modules/user/user.schema.js';
import { ConflictError } from '#shared/errors/apiErrors/ConflictError.js';

export interface IRegisterArgs {
    body: IRegisterBody;
    logger: FastifyBaseLogger;
}

interface IRegisterNewPageArgs extends IRegisterArgs {
    user: User;
}

export default class UserController {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async register({ body, logger }: IRegisterArgs) {
        const { username, page, email }: IRegisterBody = body;

        // find the user by email
        const user = await this.userRepository?.findUserByEmail(email);

        // user not found by email
        if (!user) {
            // find the username
            const doesUsernameExist =
                await this.userRepository.findUserByUsername(username);
            if (doesUsernameExist) {
                logger.info(
                    {
                        username,
                        email,
                    },
                    'Username registered with different email',
                );
                throw new ConflictError('Username registered with different email');
            }

            // user not found by username, register new user
            return this.registerNewUser({ body, logger });
        }

        // user exist with email but username doesn't matched
        if (user.username !== username) {
            logger.info(
                {
                    username,
                    email,
                },
                'Username registered with different email',
            );
            throw new ConflictError('Username registered with different email');
        }

        // user exist with given email and associated username
        const doesPageExist = await this.userRepository.findPageByUserId({
            userId: user.id,
            slug: page,
        });
        if (doesPageExist) {
            logger.info(
                {
                    username,
                    page,
                },
                'Page already exists with given username',
            );
            throw new ConflictError('Page already exists with given username');
        }

        // else create new page for given username
        return this.registerNewPage({ body, logger, user });
    }

    // register new user with new email, and username
    async registerNewUser({ body, logger }: IRegisterArgs) {
        const { username, page, email, count, source }: IRegisterBody = body;

        const initialCount = count ?? 0;

        logger.info(
            {
                username,
                page,
            },
            'Creating new user',
        );

        // register the username and page
        const { user: createdUser, page: createdPage } =
            await this.userRepository.register({
                username,
                email,
                count: count ?? 0,
                ...(source !== undefined ? { source } : {}),
                page,
                isSeeded: initialCount > 0,
                seededAt: initialCount > 0 ? new Date() : null,
            });

        return {
            username: createdUser.username,
            email: createdUser.email,
            page: createdPage.slug,
            count: createdPage.count,
            source: createdPage.source,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt,
        };
    }

    // register new user with existing email and username
    async registerNewPage({ body, logger, user }: IRegisterNewPageArgs) {
        const { page, count, source } = body;
        const { username, id: userId } = user;

        const initialCount = count ?? 0;

        logger.info(
            {
                username,
                page,
                userId,
            },
            'Creating new page for Existing User',
        );

        const params = {
            userId,
            page,
            count: initialCount,
            source,
            isSeeded: initialCount > 0,
            seededAt: initialCount > 0 ? new Date() : null,
        };

        const createdPage = await this.userRepository.registerPage({ params });

        return {
            username: user.username,
            email: user.email,
            page: createdPage.slug,
            count: createdPage.count,
            source: createdPage.source,
            createdAt: createdPage.createdAt,
            updatedAt: createdPage.updatedAt,
        };
    }
}
