import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

import { env } from '#config/env.js';

export default function createPrismaClient(): {
    prisma: PrismaClient;
    pool: pg.Pool;
} {
    const pool = new pg.Pool({
        connectionString: env.DATABASE_URL,

        /* It requires to be decreased when scaling out, otherwise it will eat RAM like cake or might crash.
        Intially expecting less traffic -> means less instances -> can have more connections.
        Must set idleTimeoutMillis > 0 to avoid opening connection for indefinitely.*/
        max: 20,

        /* Requires min to be 1, so connections are always available,
        to avoid making new tcp connections after idleTimeoutMillis gap, which is very normal in low traffic.
        Min=1 ensures connections are always available, latency decreased on low traffic */
        min: 1,

        /* It heavily depends on the application's traffic pattern.
        Initially set to 20 seconds to avoid timeout, value incresed because at least 1 client is always available */
        idleTimeoutMillis: 20_000,

        /* might increase this in production */
        connectionTimeoutMillis: 2_000,
    });

    const adapter = new PrismaPg(pool);

    const prisma = new PrismaClient({
        adapter,
        log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    return {
        prisma,
        pool,
    };
}
