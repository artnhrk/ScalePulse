import type { FastifyInstance } from 'fastify';

export default function visitRoutes(app: FastifyInstance) {
    app.get('/:username/:page', () => {
        return 'visit';
    });

    app.post('/set-count', () => {
        return 'rest';
    });
}
