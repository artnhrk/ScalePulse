import type { FastifySchema } from 'fastify';

import { healthResponseSchema } from '#modules/health/health.schema.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

export const baseHealthSchema: FastifySchema = {
    tags: ['Health'],
    description: 'Returns server uptime and dependency health status' as string,
    response: {
        [StatusCode.OK]: {
            description: 'Health status response (healthy, unhealthy, or degraded)',
            ...healthResponseSchema,
        },
    },
};

export const getHealthOptions = (summary: string, description?: string) => ({
    schema: {
        ...baseHealthSchema,
        summary,
        description: description ?? (baseHealthSchema.description as string),
    },
});
