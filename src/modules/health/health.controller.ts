import { HealthStatusEnum } from '#shared/enums/healthStatus.enum.js';
import { ServiceStatusEnum } from '#shared/enums/serviceStatus.enum.js';

import type { HealthRepository } from './health.repo.js';

export default class HealthController {
    constructor(private healthRepo: HealthRepository) {}

    healthCheck() {
        return {
            status: HealthStatusEnum.HEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }

    async dbHealthCheck() {
        const isDbHealthy = await this.healthRepo.checkDb();

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
