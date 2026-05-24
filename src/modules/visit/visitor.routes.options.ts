import type { FastifySchema } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { setInitialCountBodySchema, visitParamsSchema, visitResponseSchema } from './visitor.schema.js';

export const setInitialCountOptions: FastifySchema = {
    tags: ['Visit'],
    summary: 'Set initial page count',
    params: visitParamsSchema,
    body: setInitialCountBodySchema,
    response: {
        [StatusCode.CREATED]: visitResponseSchema,
    },
};

export const getVisitOptions: FastifySchema = {
    tags: ['Visit'],
    summary: 'Get visit count for a page',
    params: visitParamsSchema,
    response: {
        [StatusCode.OK]: visitResponseSchema,
    },
};