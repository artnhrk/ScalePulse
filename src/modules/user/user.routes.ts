import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import UserController from './user.controller.js';
import type { UserRepository } from './user.repo.js';
import { registerOptions } from './user.routes.options.js';

export default function userRoutes(
    app: FastifyInstance,
    { userRepository }: { userRepository: UserRepository },
) {
    const userController = new UserController(userRepository);
    const routes = app.withTypeProvider<TypeBoxTypeProvider>();

    routes.post('/register', { schema: registerOptions }, async (req, reply) => {
        const logger = req.log;
        const body = req.body;

        return reply
            .status(StatusCode.CREATED)
            .send(await userController.register({ body, logger }));
    });
}
