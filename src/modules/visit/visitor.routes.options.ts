import type { FastifySchema } from 'fastify';

import { visitParamsSchema, visitResponseSchema } from '#modules/visit/visitor.schema.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

export const getVisitOptions = {
    tags: ['Visit'],
    summary: 'Get visit count for a page',
    params: visitParamsSchema,
    response: {
        [StatusCode.OK]: visitResponseSchema,
    },
} satisfies FastifySchema;
