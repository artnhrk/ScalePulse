import type { FastifyBaseLogger } from 'fastify';

export interface RegisterArgs {
    body: {
        username: string;
        page: string;
        email: string; // email is required for later migrations without braking
        count?: number; // this will be visible to everyone, [for migrations from other platforms]
        source?: string; // this will be visible to everyone, [for migrations from other platforms]
    };
    logger: FastifyBaseLogger;
}

export default class UserController {
    register({ body, logger: _logger }: RegisterArgs) {
        const { username, page, email, count, source } = body;

        /*
        - Check if the username exists or not
        - if it doesn't:
            - check that the email exists or not
            - if it doesn't:
                - register the user with the username and email
            - if it does:
                - return an error (409 Conflict)
        - if it does:
            - match the email
            - if it doesn't:
                - return an error (409 Conflict)
            - if it does:
                - register the user with the username and email
         */

        return {
            username,
            page,
            email,
            count: count ?? 0,
            countSource: source ?? null,
        };
    }
}
