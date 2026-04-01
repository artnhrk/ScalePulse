import type { FastifyInstance } from 'fastify';

import visitorRoutes from './visitor.routes.js';

export default async function (app: FastifyInstance) {
    await app.register(visitorRoutes);
}
