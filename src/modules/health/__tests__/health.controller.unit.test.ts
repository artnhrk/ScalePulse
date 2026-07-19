import { describe, expect, it } from 'vitest';

import HealthController from '../health.controllers.js';
import type { HealthRepository } from '../health.repo.js';

const repoMock = {
    checkDb: () => Promise.resolve(true),
} as unknown as HealthRepository;

describe('Health Controller (unit)', () => {
    const healthController = new HealthController(repoMock);

    it('should return health info', () => {
        const result = healthController.healthCheck();

        expect(result.status).toBe('healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
    });
});
