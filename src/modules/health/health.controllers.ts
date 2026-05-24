import type { FastifyInstance } from 'fastify';

import { HealthStatusEnum } from '#shared/enums/healthStatus.enum.js';
import { ServiceStatusEnum } from '#shared/enums/serviceStatus.enum.js';

import { HealthRepository } from './health.repo.js';

export default class HealthController {
    healthCheck() {
        return {
            status: HealthStatusEnum.HEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }

    async dbHealthCheck(app: FastifyInstance) {
        const repo = new HealthRepository(app.prisma);
        const isDbHealthy = await repo.checkDb();

        return {
            status: isDbHealthy ? HealthStatusEnum.HEALTHY : HealthStatusEnum.UNHEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
            services: {
                db: isDbHealthy ? ServiceStatusEnum.UP : ServiceStatusEnum.DOWN,
            },
        };
    }
}
