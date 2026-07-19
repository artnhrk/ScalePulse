import type { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import HealthController from '../health.controllers.js';

const prismaMock = {
    $queryRaw: () => Promise.resolve([[1]]),
} as unknown as PrismaClient;

describe('Health Controller (unit)', () => {
    const healthController = new HealthController(prismaMock);

    it('should return health info', () => {
        const result = healthController.healthCheck();

        expect(result.status).toBe('healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
    });
});
