import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaCtor } = vi.hoisted(() => ({
    prismaCtor: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(function (this: unknown, ...args: unknown[]) {
        prismaCtor(args[0]);
        return this;
    }),
}));

describe('prisma (unit)', () => {
    beforeEach(() => {
        vi.resetModules();
        // clear the globally cached prisma instance so a fresh client is constructed
        (globalThis as { prisma?: unknown }).prisma = undefined;
        prismaCtor.mockClear();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should construct a client with verbose log config in development', async () => {
        vi.stubEnv('NODE_ENV', 'development');

        const { default: prisma } = await import('#infra/database/prisma.js');

        expect(prisma).toBeDefined();
        expect(prismaCtor).toHaveBeenCalledTimes(1);
        expect(prismaCtor).toHaveBeenCalledWith(
            expect.objectContaining({ log: ['query', 'error', 'warn'] }),
        );
    });
});
