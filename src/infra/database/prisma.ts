import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

import { env } from '../../config/env.js';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// create the native pg-pool
const pool = new pg.Pool({
    connectionString: process.env['DATABASE_URL'],
    max: 20, // adjust later as per db instance size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// wrap it in adapter
const adapter = new PrismaPg(pool);

// initializing prisma
const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter, // inject adapter
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
