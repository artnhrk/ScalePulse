import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import prismaPlugin from '#infra/database/prisma.plugin.js';

const { createPrismaClientMock, prismaMock, poolMock } = vi.hoisted(() => {
    const prismaMock = { $connect: vi.fn(), $disconnect: vi.fn() };
    const poolMock = { end: vi.fn() };

    return {
        createPrismaClientMock: vi.fn(() => ({ prisma: prismaMock, pool: poolMock })),
        prismaMock,
        poolMock,
    };
});

vi.mock('#infra/database/prisma.js', () => ({
    default: createPrismaClientMock,
}));

describe('prisma plugin (unit)', () => {
    beforeEach(() => {
        prismaMock.$connect.mockClear();
        prismaMock.$disconnect.mockClear();
        poolMock.end.mockClear();
        createPrismaClientMock.mockClear();
    });

    it('should create a client and decorate the fastify instance with it', async () => {
        const app = Fastify();
        await app.register(prismaPlugin);

        expect(createPrismaClientMock).toHaveBeenCalledTimes(1);
        expect(prismaMock.$connect).toHaveBeenCalledTimes(1);
        expect(app.prisma).toBe(prismaMock);

        await app.close();
    });

    it('should disconnect the prisma client and end the pool on close', async () => {
        const app = Fastify();
        await app.register(prismaPlugin);

        await app.close();

        expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
        expect(poolMock.end).toHaveBeenCalledTimes(1);
    });
});
