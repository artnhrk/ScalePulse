import type { FastifyInstance } from 'fastify';

import visitRoutes from './visit.routes.js';

export default async function (app: FastifyInstance) {
    await app.register(visitRoutes);
}
