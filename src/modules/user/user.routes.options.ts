import type { FastifySchema } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import {
    errorResponseSchema,
    registerBodySchema,
    registerResponseSchema,
} from './user.schema.js';

export const registerOptions = {
    tags: ['User'],
    summary: 'Register a user page for tracking',
    body: registerBodySchema,
    response: {
        [StatusCode.CREATED]: registerResponseSchema,
        [StatusCode.INTERNAL_SERVER_ERROR]: errorResponseSchema,
    },
} satisfies FastifySchema;
