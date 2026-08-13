import { describe, expect, it, vi } from 'vitest';

import HealthController from '../health.controller.js';
import type { HealthRepository } from '../health.repo.js';

const checkDbMock = vi.fn();

const repoMock = {
    checkDb: checkDbMock,
} as unknown as HealthRepository;

describe('Health Controller (unit)', () => {
    const healthController = new HealthController(repoMock);

    it('should return health info', () => {
        const result = healthController.healthCheck();

        expect(result.status).toBe('healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
    });

    it('should return healthy status when db is up', async () => {
        checkDbMock.mockResolvedValueOnce(true);

        const result = await healthController.dbHealthCheck();

        expect(result.status).toBe('healthy');
        expect(result.services).toEqual({ db: 'up' });
    });

    it('should return unhealthy status when db is down', async () => {
        checkDbMock.mockResolvedValueOnce(false);

        const result = await healthController.dbHealthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.services).toEqual({ db: 'down' });
    });
});
