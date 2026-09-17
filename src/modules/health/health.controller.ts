import type { HealthRepository } from '#modules/health/health.repo.js';
import { HealthStatusEnum } from '#shared/enums/healthStatus.enum.js';
import { ServiceStatusEnum } from '#shared/enums/serviceStatus.enum.js';
import logger from '#shared/logger/logger.js';

export default class HealthController {
    constructor(private healthRepo: HealthRepository) {}

    healthCheck() {
        return {
            status: HealthStatusEnum.HEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
        };
    }

    async serviceHealthCheck() {
        const isDbHealthy = await this.healthRepo.checkDb();
        const isRedisHealthy = await this.healthRepo.checkRedis();

        const isEverthingHealthy = isDbHealthy && isRedisHealthy;

        await new Promise<void>((resolve) => {
            setTimeout(() => {
                logger.info('Task Completed');
                resolve();
            }, 10_000);
        });

        return {
            status: isEverthingHealthy
                ? HealthStatusEnum.HEALTHY
                : HealthStatusEnum.UNHEALTHY,
            uptime: process.uptime(),
            timestamp: Date.now(),
            services: {
                db: isDbHealthy ? ServiceStatusEnum.UP : ServiceStatusEnum.DOWN,
                redis: isRedisHealthy ? ServiceStatusEnum.UP : ServiceStatusEnum.DOWN,
            },
        };
    }
}
