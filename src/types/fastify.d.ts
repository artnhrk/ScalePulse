import 'fastify';

import type { PrismaClient } from '@prisma/client';

import type { Env } from '#config/env.schema.js';

declare module 'fastify' {
    interface FastifyInstance {
        config: Env;
        prisma: PrismaClient;
    }

    interface FastifyRequest {
        requestId: string;
    }
}
