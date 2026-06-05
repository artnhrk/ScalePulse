import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';

import UserController from './user.controller.js';
import { registerOptions } from './user.routes.options.js';

export default function userRoutes(app: FastifyInstance) {
    const userController = new UserController();
    const routes = app.withTypeProvider<TypeBoxTypeProvider>();

    routes.post('/register/:username/:page', { schema: registerOptions }, (req) => {
        const logger = req.log;
        const params = req.params;
        return userController.setInitialCount({ params, logger });
    });
}
