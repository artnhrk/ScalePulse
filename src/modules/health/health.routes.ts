import type { FastifyInstance } from 'fastify';

import HealthController from '#modules/health/health.controller.js';
import type { HealthRepository } from '#modules/health/health.repo.js';
import { getHealthOptions } from '#modules/health/health.routes.options.js';

export default function healthRoutes(
    app: FastifyInstance,
    { healthRepository }: { healthRepository: HealthRepository },
) {
    const healthController = new HealthController(healthRepository);

    // Route 1: Check the health of the server '/health' [using GET] (public)
    app.get('/health', getHealthOptions('Check Server Health'), () =>
        healthController.healthCheck(),
    );

    // Route 2: Check the health of the database '/health/db' [using GET] (public)
    app.get('/health/service', getHealthOptions('Check DB Health'), () =>
        healthController.serviceHealthCheck(),
    );

    // Route 3: Check the health of the db '/health/db' [using GET] (public)
    app.get('/health/db', getHealthOptions('Check DB Health'), () =>
        healthController.dbHealthCheck(),
    );

    // Route 4: Check the health of the Redis cache '/health/redis' [using GET] (public)
    app.get('/health/redis', getHealthOptions('Check Redis Health'), () =>
        healthController.redisHealthCheck(),
    );
}
