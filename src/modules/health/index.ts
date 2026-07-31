import type { FastifyInstance } from 'fastify';

import { HealthRepository } from './health.repo.js';
import healthRoutes from './health.routes.js';

export default async function healthModules(app: FastifyInstance) {
    const healthRepository = new HealthRepository(app.prisma);
    await app.register(healthRoutes, { healthRepository });
}
