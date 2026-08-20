import { Prisma } from '@prisma/client';
import type { FastifyError, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { ApiError } from '#shared/errors/apiErrors/ApiError.js';

export default fp((app: FastifyInstance) => {
    app.setErrorHandler((error, req, reply) => {
        if (error instanceof ApiError) {
            // Log expected errors as .warn (API Error in this case)
            req.log.warn(error);

            return reply.status(error.statusCode).send({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        }

        if (error instanceof Error && 'validation' in error) {
            // Log expected errors as .warn (Validation Error in this case)
            req.log.warn(error);

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

        // Handle Prisma unique constraint error
        // To handle duplicate key errors or duplicate entries
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            // Log expected errors as .warn (Prisma unique constraint error in this case)
            req.log.warn(error);

            return reply.status(StatusCode.CONFLICT).send({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'Resource already exists',
                },
            });

            /* For specific error message (Future scope)
                - error.meta
                - or, error.meta.target
             */
        }

        const fastifyError = error as FastifyError;
        const statusCode = fastifyError.statusCode ?? StatusCode.INTERNAL_SERVER_ERROR;

        // Log unexpected errors as .error
        req.log.error(error);

        return reply.status(statusCode).send({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something Went Wrong',
            },
        });
        /* In the above code, we might send 4xx code with 'Something Went Wrong' message.
        Which is weird and unexpected. Fix this by extracting actual error message from error object. */
    });
});
