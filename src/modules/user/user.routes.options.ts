import type { FastifySchema } from 'fastify';

import {
    registerBodySchema,
    registerResponseSchema,
    userParamSchema,
    userResponseSchema,
} from '#modules/user/user.schema.js';
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

export const userOptions = {
    tags: ['User'],
    summary: 'Get a user information',
    params: userParamSchema,
    response: {
        [StatusCode.OK]: userResponseSchema,
        [StatusCode.BAD_REQUEST]: apiErrorResponseSchema,
        [StatusCode.NOT_FOUND]: apiErrorResponseSchema,
        [StatusCode.INTERNAL_SERVER_ERROR]: apiErrorResponseSchema,
    },
} satisfies FastifySchema;
