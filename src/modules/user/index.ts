import type { FastifyInstance } from 'fastify';

import { UserRepository } from './user.repo.js';
import userRoutes from './user.routes.js';

export interface IUserModuleOptions {
    userRepository: UserRepository | undefined;
}

export default async function userModule(
    app: FastifyInstance,
    { userRepository }: IUserModuleOptions,
) {
    const repo = userRepository ?? new UserRepository(app.prisma);
    await app.register(userRoutes, { userRepository: repo });
}
