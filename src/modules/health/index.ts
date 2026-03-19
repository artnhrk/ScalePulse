import type { FastifyInstance } from 'fastify';

import healthRoutes from './health.routes.js';

export default async function healthModules(app: FastifyInstance) {
    await app.register(healthRoutes);
}
