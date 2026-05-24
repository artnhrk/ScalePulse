import type { FastifyInstance, FastifyRequest } from 'fastify';

import VisitorController from './visitor.controller.js';
import { getVisitOptions, setInitialCountOptions } from './visitor.routes.options.js';
import type { VisitParams } from './visitor.schema.js';

export default function visitRoutes(app: FastifyInstance) {
    const visitorController = new VisitorController();

    app.post(
        '/set-count/:username/:page',
        { schema: setInitialCountOptions },
        (req: FastifyRequest<{ Params: VisitParams }>) => {
            return visitorController.setInitialCount(req.params);
        },
    );

    app.get(
        '/:username/:page',
        { schema: getVisitOptions },
        (req: FastifyRequest<{ Params: VisitParams }>) => {
            return visitorController.setInitialCount(req.params);
        },
    );
}
