import type { FastifyInstance } from 'fastify';

import visitRoutes from '#modules/visit/visit.routes.js';

export default async function (app: FastifyInstance) {
    await app.register(visitRoutes);
}
