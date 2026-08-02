import type { FastifyBaseLogger } from 'fastify';

import { ConflictError } from '#shared/errors/apiErrors/ConflictError.js';

import type { UserRepository } from './user.repo.js';
import type { RegisterBody } from './user.schema.js';

export interface RegisterArgs {
    body: RegisterBody;
    logger: FastifyBaseLogger;
}

export default class UserController {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async register({ body, logger }: RegisterArgs) {
        const { username, page, email, count, source }: RegisterBody = body;

        // find the user by email
        const user = await this.userRepository?.findByEmail(email);

        // user not found by email
        if (!user) {
            // find the username
            const doesUsernameExist = await this.userRepository.findByUsername(username);
            if (doesUsernameExist) {
                throw new ConflictError(`Username registered with different email`);
            }

            // user not found by username, register new user
            return this.registerNewUser({ body, logger });
        }

        // user exist with email but username doesn't matched
        if (user && user.username !== username) {
            throw new ConflictError(`Username registered with different email`);
        }

        // find the page, no-duplicate page created
        const allPages = await this.userRepository.getAllPages({ userId: user.id });

        // user exist with given email and associated username
        const doesPageExist = allPages.filter((pageData) => pageData?.slug === page);
        if (doesPageExist) {
            throw new ConflictError('Page already exists with given username');
        }

        // else create new page for given username

        return Promise.resolve({
            username,
            page,
            email,
            count: count ?? 0,
            source: source ?? undefined,
        });
    }

    async registerNewUser({ body, logger }: RegisterArgs) {
        const { username, page, email, count, source }: RegisterBody = body;

        const initialCount = count ?? 0;

        logger.info('Creating new user');

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

        return Promise.resolve({
            username: createdUser.username,
            email: createdUser.email,
            page: createdPage.id,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt,
        });
    }
}

/*
        - find the email
        - if email exist:
            - match the username
            - if username matched:
                - find page
                - if page exists:
                    - return conflict
                - if page doesn't exist:
                    - create the page
            - if username doesn't matched:
                - return conflict
        - if email doesn't exist:
        - find the username
        - if username exist:
            - return conflict
        - if username doesn't exist:
            - create the username and page with given email
         */

// assume everything is ok and username and page registered
// const { user: createdUser, page: createdPage } =
//     await this.userRepository.register({
//         username,
//         page,
//         email,
//         count: count ?? 0,
//         ...(source !== undefined ? { source } : {}),
//     });

/** Completed section
 * if username and email is new, then register
 */
