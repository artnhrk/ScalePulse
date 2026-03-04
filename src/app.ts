import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastify, { type FastifyReply, type FastifyRequest } from 'fastify';

// creating fastify instance
const app = fastify({
    logger: false,
});

// registering required plugins
app.register(cors);
app.register(helmet);

// all routes
app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply
        .status(200)
        .send({ statusCode: 200, message: 'Server is up and running' });
});

export default app;
