import type { FastifyInstance } from 'fastify';

import userRoutes from './user.routes.js';

export default async function (app: FastifyInstance) {
    await app.register(userRoutes);
}
