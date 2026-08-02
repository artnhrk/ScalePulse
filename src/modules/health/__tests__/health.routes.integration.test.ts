import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it, type MockInstance, vi } from 'vitest';

import buildApp from '#app/app.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { HealthRepository } from '../health.repo.js';

describe('Health Routes (integration)', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return status code 200', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/health',
        });

        expect(res.statusCode).toBe(StatusCode.OK);
    });
});

describe('Health DB Routes (integration)', () => {
    let app: FastifyInstance;
    let checkDbSpy: MockInstance;

    beforeAll(async () => {
        checkDbSpy = vi
            .spyOn(HealthRepository.prototype, 'checkDb')
            .mockResolvedValue(true);
        app = await buildApp();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }

        vi.restoreAllMocks();
    });

    it('should return healthy status when db is up', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/health/db',
        });

        expect(res.statusCode).toBe(StatusCode.OK);
        expect(res.json()).toMatchObject({
            status: 'healthy',
            services: { db: 'up' },
        });
    });

    it('should return unhealthy status when db is down', async () => {
        checkDbSpy.mockResolvedValueOnce(false);

        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/health/db',
        });

        expect(res.statusCode).toBe(StatusCode.OK);
        expect(res.json()).toMatchObject({
            status: 'unhealthy',
            services: { db: 'down' },
        });
    });
});
