import type { FastifySchema } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import {
    errorResponseSchema,
    registerBodySchema,
    visitParamsSchema,
    visitResponseSchema,
} from './visitor.schema.js';

export const registerOptions = {
    tags: ['Visit'],
    summary: 'Set initial page count',
    params: visitParamsSchema,
    body: registerBodySchema,
    response: {
        [StatusCode.CREATED]: visitResponseSchema,
        [StatusCode.INTERNAL_SERVER_ERROR]: errorResponseSchema,
    },
} satisfies FastifySchema;

export const getVisitOptions = {
    tags: ['Visit'],
    summary: 'Get visit count for a page',
    params: visitParamsSchema,
    response: {
        [StatusCode.OK]: visitResponseSchema,
    },
} satisfies FastifySchema;
