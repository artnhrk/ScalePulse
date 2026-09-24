import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaCtor, poolCtor, adapterCtor, poolMock } = vi.hoisted(() => {
    const prismaMock = { $connect: vi.fn(), $disconnect: vi.fn() };
    const poolMock = { end: vi.fn() };

    return {
        prismaCtor: vi.fn((_options: unknown) => prismaMock),
        poolCtor: vi.fn((_options: unknown) => poolMock),
        adapterCtor: vi.fn((_pool: unknown) => ({})),
        poolMock,
    };
});

vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(function (this: unknown, options: unknown) {
        return prismaCtor(options);
    }),
}));

vi.mock('@prisma/adapter-pg', () => ({
    PrismaPg: vi.fn(function (this: unknown, pool: unknown) {
        return adapterCtor(pool);
    }),
}));

vi.mock('pg', () => ({
    default: {
        Pool: vi.fn(function (this: unknown, options: unknown) {
            return poolCtor(options);
        }),
    },
}));

const stubValidEnv = (nodeEnv = 'production') => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    vi.stubEnv('PORT', '3000');
    vi.stubEnv('LOG_LEVEL', 'info');
    vi.stubEnv(
        'COOKIE_SECRET',
        'thisisarandomcookiesecretstringtosurpassthe32characterlimit',
    );
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('REDIS_URI', 'redis://localhost:6379');
};

interface PoolOptions {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

const getPoolOptions = () => poolCtor.mock.calls[0]?.[0] as PoolOptions | undefined;

describe('prisma (unit)', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        stubValidEnv();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should construct a pooled client using the DATABASE_URL env variable', async () => {
        const { default: createPrismaClient } = await import('#infra/database/prisma.js');

        const { prisma, pool } = createPrismaClient();

        expect(prisma).toBeDefined();
        expect(pool).toBeDefined();
        expect(poolCtor).toHaveBeenCalledTimes(1);
        expect(getPoolOptions()).toMatchObject({
            connectionString: 'postgresql://postgres:postgres@localhost:5432/test',
            max: 20,
            min: 1,
            idleTimeoutMillis: 20_000,
            connectionTimeoutMillis: 2_000,
        });
    });

    it('should pass the pg pool to the adapter', async () => {
        const { default: createPrismaClient } = await import('#infra/database/prisma.js');

        createPrismaClient();

        expect(adapterCtor).toHaveBeenCalledTimes(1);
        expect(adapterCtor.mock.calls[0]?.[0]).toBe(poolMock);
    });

    it('should enable verbose logging in development', async () => {
        vi.resetModules();
        vi.clearAllMocks();
        stubValidEnv('development');

        const { default: createPrismaClient } = await import('#infra/database/prisma.js');

        createPrismaClient();

        expect(prismaCtor).toHaveBeenCalledTimes(1);
        expect(prismaCtor).toHaveBeenCalledWith(
            expect.objectContaining({ log: ['error', 'warn'] }),
        );
    });

    it('should only log errors outside development', async () => {
        const { default: createPrismaClient } = await import('#infra/database/prisma.js');

        createPrismaClient();

        expect(prismaCtor).toHaveBeenCalledTimes(1);
        expect(prismaCtor).toHaveBeenCalledWith(
            expect.objectContaining({ log: ['error'] }),
        );
    });

    it('should create a new client and pool on each call', async () => {
        const { default: createPrismaClient } = await import('#infra/database/prisma.js');

        createPrismaClient();
        createPrismaClient();

        expect(poolCtor).toHaveBeenCalledTimes(2);
        expect(prismaCtor).toHaveBeenCalledTimes(2);
    });
});
