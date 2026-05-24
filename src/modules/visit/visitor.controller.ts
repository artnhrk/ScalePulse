import type { FastifyBaseLogger } from 'fastify';

export interface SetInitialCountArgs {
    params: {
        username: string;
        page: string;
    };
    logger: FastifyBaseLogger;
}

export default class VisitorController {
    setInitialCount({ params, logger: _logger }: SetInitialCountArgs) {
        return {
            username: params.username,
            page: params.page,
            count: 0,
        };
    }
}
