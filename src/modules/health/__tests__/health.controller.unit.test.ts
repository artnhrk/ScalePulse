import { describe, expect, it } from 'vitest';

import HealthController from '../health.controllers.js';

describe('Health Controller (unit)', () => {
    const healthController = new HealthController();

    it('should return health info', () => {
        const result = healthController.healthCheck();

        expect(result.status).toBe('healthy');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('uptime');
    });
});
