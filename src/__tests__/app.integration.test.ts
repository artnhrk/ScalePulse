import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import buildApp from '../app.js';

describe('App (integration)', () => {
    let app: FastifyInstance;

    function getRoutes(app: FastifyInstance): string {
        return app.printRoutes();
    }

    describe('when running in default environment', () => {
        beforeAll(async () => {
            app = await buildApp();
        });

        afterAll(async () => {
            if (app) {
                await app.close();
            }
        });

        it('should create a Fastify instance', async () => {
            expect(app).toBeDefined();
            expect(app.server).toBeTruthy();

            await expect(app.ready()).resolves.not.toThrow();
        });

        it('should expose the "/health" route', () => {
            expect(getRoutes(app)).toContain('health');
        });

        it('should expose the "/docs" route', () => {
            expect(getRoutes(app)).toContain('docs');
        });

        it('should expose the "/swagger" route', () => {
            expect(getRoutes(app)).toContain('swagger');
        });
    });

    describe('when NODE_ENV is "production"', () => {
        beforeAll(async () => {
            // set the env before importing the app
            vi.stubEnv('NODE_ENV', 'production');

            // force a fresh module import so env-dependent logic re-runs
            vi.resetModules();
            const { default: buildAppFresh } = await import('../app.js');

            app = await buildAppFresh();
        });

        afterAll(async () => {
            if (app) {
                await app.close();
            }

            // reset envs after all tests in this describe
            vi.unstubAllEnvs();
        });

        it('should expose the "/health" route', () => {
            expect(getRoutes(app)).toContain('health');
        });

        it('should expose the "/docs" route', () => {
            expect(getRoutes(app)).toContain('docs');
        });

        it('should not expose the "/swagger" route', () => {
            expect(getRoutes(app)).not.toContain('swagger');
        });
    });
});
