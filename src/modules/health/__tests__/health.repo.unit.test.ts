import type { PrismaClient } from '@prisma/client';
import type { Redis } from 'ioredis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthRepository } from '#modules/health/health.repo.js';

const checkDbMock = vi.fn();
const checkRedisMock = vi.fn();

const prismaMock = {
    $queryRaw: checkDbMock,
} as unknown as PrismaClient;

const redisMock = {
    ping: checkRedisMock,
} as unknown as Redis;

describe('Health Repository (unit)', () => {
    const healthRepository = new HealthRepository({
        prisma: prismaMock,
        redis: redisMock,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkDb', () => {
        it('should return true when the db query succeeds', async () => {
            checkDbMock.mockResolvedValueOnce([{ '?column?': 1 }]);

            await expect(healthRepository.checkDb()).resolves.toBe(true);
        });

        it('should return false when the db query fails', async () => {
            checkDbMock.mockRejectedValueOnce(new Error('db down'));

            await expect(healthRepository.checkDb()).resolves.toBe(false);
        });
    });

    describe('checkRedis', () => {
        it('should return true when the redis ping succeeds', async () => {
            checkRedisMock.mockResolvedValueOnce('PONG');

            await expect(healthRepository.checkRedis()).resolves.toBe(true);
        });

        it('should return false when the redis ping fails', async () => {
            checkRedisMock.mockRejectedValueOnce(new Error('redis down'));

            await expect(healthRepository.checkRedis()).resolves.toBe(false);
        });

        it('should return false when the redis ping fails with another value', async () => {
            checkRedisMock.mockResolvedValueOnce('NOT_PONG');

            await expect(healthRepository.checkRedis()).resolves.toBe(false);
        });
    });
});
