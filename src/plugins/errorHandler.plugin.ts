import type { FastifyError, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { ApiError } from '#shared/errors/apiErrors/ApiError.js';

export default fp((app: FastifyInstance) => {
    app.setErrorHandler((error, req, reply) => {
        req.log.error(error);

        if (error instanceof ApiError) {
            return reply.status(error.statusCode).send({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        }

        if (error instanceof Error && 'validation' in error) {
            const fastifyError = error as FastifyError;
            const details = (fastifyError.validation ?? []).map((err) => ({
                field: err.instancePath || 'body',
                message: err.message,
            }));

            return reply.status(StatusCode.BAD_REQUEST).send({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details,
                },
            });
        }

        const fastifyError = error as FastifyError;
        const statusCode = fastifyError.statusCode ?? StatusCode.INTERNAL_SERVER_ERROR;

        return reply.status(statusCode).send({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something Went Wrong',
            },
        });
    });
});
