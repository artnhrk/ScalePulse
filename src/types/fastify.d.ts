import 'fastify';

import type { PrismaClient } from '@prisma/client';

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            NODE_ENV: string;
            PORT: number;
            LOG_LEVEL: string;
        };
        prisma: PrismaClient;
    }

    interface FastifyRequest {
        requestId: string;
    }
}
