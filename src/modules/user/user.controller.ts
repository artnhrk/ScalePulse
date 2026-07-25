import type { FastifyBaseLogger } from 'fastify';

export interface RegisterArgs {
    params: {
        username: string;
        page: string;
    };
    body: {
        email: string; // email is required for later migrations without braking
        initialCount?: number; // this will be visible to everyone
    };
    logger: FastifyBaseLogger;
}

export default class UserController {
    register({ params, body, logger: _logger }: RegisterArgs) {
        const { username, page } = params;
        const { email, initialCount } = body;

        return {
            username,
            page,
            email,
            count: initialCount ?? 0,
        };
    }
}
