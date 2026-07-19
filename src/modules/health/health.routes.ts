import type { FastifyInstance } from 'fastify';

import HealthController from './health.controllers.js';
import { HealthRepository } from './health.repo.js';
import { getHealthOptions } from './health.routes.options.js';

export default function healthRoutes(app: FastifyInstance) {
    const healthRepo = new HealthRepository(app.prisma);
    const healthController = new HealthController(healthRepo);

    // Route 1: Check the health of the server '/health' [using GET] (public)
    app.get('/health', getHealthOptions('Check Server Health'), () =>
        healthController.healthCheck(),
    );

    // Route 2: Check the health of the database '/health/db' [using GET] (public)
    app.get('/health/db', getHealthOptions('Check DB Health'), () =>
        healthController.dbHealthCheck(),
    );
}
