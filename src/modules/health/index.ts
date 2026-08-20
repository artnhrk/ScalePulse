import type { FastifyInstance } from 'fastify';

import { HealthRepository } from './health.repo.js';
import healthRoutes from './health.routes.js';

export interface IHealthModuleOptions {
    healthRepository: HealthRepository | undefined;
}

export default async function healthModule(
    app: FastifyInstance,
    { healthRepository }: IHealthModuleOptions,
) {
    const repo = healthRepository ?? new HealthRepository(app.prisma);
    await app.register(healthRoutes, { healthRepository: repo });
}