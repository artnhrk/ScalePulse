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
        try {
            const { username, page } = params;
            return {
                username,
                page,
                count: 0,
            };
        } catch (error) {
            _logger.error(error);
            throw error;
        }
    }
}
