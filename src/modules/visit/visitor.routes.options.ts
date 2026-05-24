import type { FastifySchema } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import {
    setInitialCountBodySchema,
    visitParamsSchema,
    visitResponseSchema,
} from './visitor.schema.js';

export const setInitialCountOptions = {
    tags: ['Visit'],
    summary: 'Set initial page count',
    params: visitParamsSchema,
    body: setInitialCountBodySchema,
    response: {
        [StatusCode.CREATED]: visitResponseSchema,
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
