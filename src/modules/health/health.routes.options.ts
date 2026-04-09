import type { FastifySchema } from 'fastify';

import { StatusCode } from '../../shared/constants/statusCodes.constant.js';
import { healthResponseSchema } from './health.schema.js';

export const baseHealthSchema: FastifySchema = {
    tags: ['Health'],
    description: 'Returns server uptime and dependency health status' as string,
    response: {
        // 200 doesn’t mean “healthy”, it means: "Request succeeded"
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
        description:
            description ?? (baseHealthSchema.description as string) ?? 'Health Check',
    },
});
