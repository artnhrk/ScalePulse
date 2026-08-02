import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { HealthRepository } from '../health.repo.js';

const checkDbMock = vi.fn();

const prismaMock = {
    $queryRaw: checkDbMock,
} as unknown as PrismaClient;

describe('Health Repository (unit)', () => {
    const healthRepository = new HealthRepository(prismaMock);

    it('should return true when the db query succeeds', async () => {
        checkDbMock.mockResolvedValueOnce([{ '?column?': 1 }]);

        await expect(healthRepository.checkDb()).resolves.toBe(true);
    });

    it('should return false when the db query fails', async () => {
        checkDbMock.mockRejectedValueOnce(new Error('db down'));

        await expect(healthRepository.checkDb()).resolves.toBe(false);
    });
});
