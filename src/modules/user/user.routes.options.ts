import type { FastifySchema } from 'fastify';

import { registerBodySchema, registerResponseSchema } from '#modules/user/user.schema.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { apiErrorResponseSchema } from '#shared/schemas/error.schema.js';

export const registerOptions = {
    tags: ['User'],
    summary: 'Register a user page for tracking',
    body: registerBodySchema,
    response: {
        [StatusCode.CREATED]: registerResponseSchema,
        [StatusCode.CONFLICT]: apiErrorResponseSchema,
        [StatusCode.INTERNAL_SERVER_ERROR]: apiErrorResponseSchema,
    },
} satisfies FastifySchema;

export const getUserOptions = (summary?: string) => ({
    ...registerOptions,
    summary: summary ?? registerOptions.summary,
});
