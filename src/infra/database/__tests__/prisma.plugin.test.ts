import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import prismaPlugin from '#infra/database/prisma.plugin.js';

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: { $disconnect: vi.fn() },
}));

vi.mock('#infra/database/prisma.js', () => ({
    default: prismaMock,
}));

describe('prisma plugin (unit)', () => {
    beforeEach(() => {
        prismaMock.$disconnect.mockClear();
    });

    it('should decorate the fastify instance with the prisma client', async () => {
        const app = Fastify();
        await app.register(prismaPlugin);

        expect(app.prisma).toBe(prismaMock);

        await app.close();
    });

    it('should disconnect the prisma client on close', async () => {
        const app = Fastify();
        await app.register(prismaPlugin);

        await app.close();

        expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
    });
});
