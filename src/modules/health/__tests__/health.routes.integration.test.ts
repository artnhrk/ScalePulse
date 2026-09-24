import { afterAll, beforeAll, describe, expect, it, type MockInstance, vi } from 'vitest';

import buildApp from '#app/app.js';
import { HealthRepository } from '#modules/health/health.repo.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';

type AppInstance = Awaited<ReturnType<typeof buildApp>>;

describe('Health routes (integration)', () => {
    let app: AppInstance;

    beforeAll(async () => {
        app = await buildApp();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Server Health: GET /api/v1/health', () => {
        it('should return status code 200', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
        });
    });

    describe('Service Health: GET /api/v1/health/service', () => {
        let checkDbSpy: MockInstance;
        let checkRedisSpy: MockInstance;

        beforeAll(() => {
            checkDbSpy = vi
                .spyOn(HealthRepository.prototype, 'checkDb')
                .mockResolvedValue(true);
            checkRedisSpy = vi
                .spyOn(HealthRepository.prototype, 'checkRedis')
                .mockResolvedValue(true);
            // via outer layer of describe
            // app = await buildApp();
        });

        afterAll(() => {
            vi.restoreAllMocks();
        });

        it('should return healthy status when db and redis are up', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/service',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'healthy',
                services: { db: 'up', redis: 'up' },
            });
        });

        it('should return unhealthy status when db is down but redis is up', async () => {
            checkDbSpy.mockResolvedValueOnce(false);

            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/service',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'unhealthy',
                services: { db: 'down' },
            });
        });

        it('should return unhealthy status when redis is down but db is up', async () => {
            checkRedisSpy.mockResolvedValueOnce(false);

            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/service',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'unhealthy',
                services: { db: 'up', redis: 'down' },
            });
        });

        it('should return unhealthy status when db and redis are down', async () => {
            checkDbSpy.mockResolvedValueOnce(false);
            checkRedisSpy.mockResolvedValueOnce(false);

            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/service',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'unhealthy',
                services: { db: 'down', redis: 'down' },
            });
        });
    });

    describe('Database Heatlh: GET /api/v1/health/db', () => {
        let dbCheckSpy: MockInstance;

        beforeAll(() => {
            dbCheckSpy = vi
                .spyOn(HealthRepository.prototype, 'checkDb')
                .mockResolvedValue(true);
        });

        afterAll(() => {
            vi.resetAllMocks();
        });

        it('should return healthy status when db is up', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/db',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'healthy',
            });
        });

        it('should return unhealthy status when db is down', async () => {
            dbCheckSpy.mockResolvedValueOnce(false);

            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/db',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'unhealthy',
            });
        });
    });

    describe('Redis Health: GET /api/v1/health/redis', () => {
        let redisCheckSpy: MockInstance;

        beforeAll(() => {
            redisCheckSpy = vi
                .spyOn(HealthRepository.prototype, 'checkRedis')
                .mockResolvedValue(true);
        });

        afterAll(() => {
            vi.resetAllMocks();
        });

        it('should return healthy status when redis is up', async () => {
            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/redis',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'healthy',
            });
        });

        it('should return unhealthy status when redis is down', async () => {
            redisCheckSpy.mockResolvedValueOnce(false);

            const res = await app.inject({
                method: 'GET',
                url: '/api/v1/health/redis',
            });

            expect(res.statusCode).toBe(StatusCode.OK);
            expect(res.json()).toMatchObject({
                status: 'unhealthy',
            });
        });
    });
});
