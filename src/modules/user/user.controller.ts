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

    async register({ body, logger: _logger }: RegisterArgs) {
        const { username, page, email, count, source } = body;

        const user = await this.userRepository?.findByEmail(email);
        if (!user) {
            throw new ConflictError('Email already registered with a different username');
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

        return Promise.resolve({
            username,
            page,
            email,
            count: count ?? 0,
            source: source ?? null,
        });
    }
}
