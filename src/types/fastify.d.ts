import 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            NODE_ENV: string;
            PORT: number;
            LOG_LEVEL: string;
        };
    }

    interface FastifyRequest {
        requestId: string;
    }
}
