import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';

import VisitorController from './visitor.controller.js';
import { getVisitOptions, setInitialCountOptions } from './visitor.routes.options.js';

export default function visitRoutes(app: FastifyInstance) {
    const visitorController = new VisitorController();
    const routes = app.withTypeProvider<TypeBoxTypeProvider>();

    routes.post(
        '/set-count/:username/:page',
        { schema: setInitialCountOptions },
        (req) => {
            return visitorController.setInitialCount(req.params);
        },
    );

    routes.get('/:username/:page', { schema: getVisitOptions }, (req) => {
        return visitorController.setInitialCount(req.params);
    });
}
