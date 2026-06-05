import type { FastifySchema } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { visitParamsSchema, visitResponseSchema } from './visitor.schema.js';

export const getVisitOptions = {
    tags: ['Visit'],
    summary: 'Get visit count for a page',
    params: visitParamsSchema,
    response: {
        [StatusCode.OK]: visitResponseSchema,
    },
} satisfies FastifySchema;
