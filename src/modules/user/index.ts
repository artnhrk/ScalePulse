import type { FastifyInstance } from 'fastify';

import { UserRepository } from './user.repo.js';
import userRoutes from './user.routes.js';

export default async function (app: FastifyInstance) {
    const userRepository = new UserRepository(app.prisma);
    await app.register(userRoutes, { userRepository });
}
