import type { PrismaClient } from '@prisma/client';

import { HealthStatusEnum } from '#shared/enums/healthStatus.enum.js';
import { ServiceStatusEnum } from '#shared/enums/serviceStatus.enum.js';

import { HealthRepository } from './health.repo.js';

export default class HealthController {
    constructor(private prisma: PrismaClient) {}

    healthCheck() {
        return {
            status: HealthStatusEnum.HEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }

    async dbHealthCheck() {
        const repo = new HealthRepository(this.prisma);
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
