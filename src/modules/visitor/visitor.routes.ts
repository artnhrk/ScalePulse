import type { FastifyInstance } from 'fastify';

export default function visitorRoutes(app: FastifyInstance) {
    // Route 1: Count the number of visitors '/visitor' [using GET] (public)
    app.get('/visitor', () => 'visitor');
}
