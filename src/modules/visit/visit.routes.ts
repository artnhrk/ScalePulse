import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';

import VisitorController from './visitor.controller.js';
import { registerOptions } from './visitor.routes.options.js';

export default function visitRoutes(app: FastifyInstance) {
    const visitorController = new VisitorController();
    const routes = app.withTypeProvider<TypeBoxTypeProvider>();

    routes.post('/register/:username/:page', { schema: registerOptions }, (req) => {
        const logger = req.log;
        const params = req.params;
        return visitorController.setInitialCount({ params, logger });
    });
}
