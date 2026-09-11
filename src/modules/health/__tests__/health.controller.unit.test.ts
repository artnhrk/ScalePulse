import { afterEach, describe, expect, it, vi } from 'vitest';

import HealthController from '#modules/health/health.controller.js';
import type { HealthRepository } from '#modules/health/health.repo.js';

const checkDbMock = vi.fn();
const checkRedisMock = vi.fn();

const repoMock = {
    checkDb: checkDbMock,
    checkRedis: checkRedisMock,
} as unknown as HealthRepository;

describe('Health Controller (unit)', () => {
    const healthController = new HealthController(repoMock);

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('should return health info', () => {
        const result = healthController.healthCheck();

        expect(result.status).toBe('healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
    });

    it('should return healthy status when all services are up', async () => {
        checkDbMock.mockResolvedValueOnce(true);
        checkRedisMock.mockResolvedValueOnce(true);

        const result = await healthController.serviceHealthCheck();

        expect(result.status).toBe('healthy');
        expect(result.services).toEqual({ db: 'up', redis: 'up' });
    });

    it('should return unhealthy status when db is down', async () => {
        checkDbMock.mockResolvedValueOnce(false);
        checkRedisMock.mockResolvedValueOnce(true);

        const result = await healthController.serviceHealthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.services).toEqual({ db: 'down', redis: 'up' });
    });

    it('should return unhealthy status when redis is down', async () => {
        checkDbMock.mockResolvedValueOnce(true);
        checkRedisMock.mockResolvedValueOnce(false);

        const result = await healthController.serviceHealthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.services).toEqual({ db: 'up', redis: 'down' });
    });

    it('should return unhealthy status when both db and redis are down', async () => {
        checkDbMock.mockResolvedValueOnce(false);
        checkRedisMock.mockResolvedValueOnce(false);

        const result = await healthController.serviceHealthCheck();

        expect(result.status).toBe('unhealthy');
        expect(result.services).toEqual({ db: 'down', redis: 'down' });
    });
});
