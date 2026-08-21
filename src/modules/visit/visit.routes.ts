import type { FastifyInstance } from 'fastify';

export default function visitRoutes(app: FastifyInstance) {
    let counter = 0;
    // visit routes will be implemented here
    // it's a dummy route for testing
    app.get('/:username/:page', () => {
        return {
            counter: ++counter,
        };
    });
}
