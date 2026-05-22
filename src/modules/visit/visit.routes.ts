import type { FastifyInstance } from 'fastify';

export default function visitRoutes(app: FastifyInstance) {
    // Route 1: Set the initial count of the page
    app.post('/set-count', () => {
        return 'rest';
    });
    app.get('/:username/:page', () => {
        return 'visit';
    });
}
