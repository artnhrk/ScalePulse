import type { FastifyInstance } from 'fastify';

import HealthController from './health.controllers.js';
import { healthRoutesOptions } from './health.routes.options.js';

export default function healthRoutes(app: FastifyInstance) {
    const healthController = new HealthController();

    // Route 1: To check the health of the server '/health' [using GET] (public)
    app.get('/health', healthRoutesOptions, () => healthController.healthCheck());
}
