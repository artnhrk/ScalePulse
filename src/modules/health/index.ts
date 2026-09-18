import type { FastifyInstance } from 'fastify';

import { HealthRepository } from '#modules/health/health.repo.js';
import healthRoutes from '#modules/health/health.routes.js';

export interface IHealthModuleOptions {
    healthRepository: HealthRepository | undefined;
}

export default async function healthModule(
    app: FastifyInstance,
    { healthRepository }: IHealthModuleOptions,
) {
    const repo =
        healthRepository ??
        new HealthRepository({ prisma: app.prisma, redis: app.redis });
    await app.register(healthRoutes, { healthRepository: repo });
}
