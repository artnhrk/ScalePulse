import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';

import UserController from './user.controller.js';
import { registerOptions } from './user.routes.options.js';

export default function userRoutes(app: FastifyInstance) {
    const userController = new UserController();
    const routes = app.withTypeProvider<TypeBoxTypeProvider>();

    routes.post('/register', { schema: registerOptions }, (req) => {
        const logger = req.log;
        const body = req.body;

        return userController.register({ body, logger });
    });
}
