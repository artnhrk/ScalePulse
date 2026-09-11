import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import configPlugin from '#config/config.plugin.js';
import { env } from '#config/env.js';

describe('Config Plugin', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify({ logger: false });
        await app.register(configPlugin);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should decorate the fastify instance with the validated env config', () => {
        expect(app.config).toBe(env);
        expect(app.config.PORT).toBe(env.PORT);
        expect(app.config.NODE_ENV).toBe(env.NODE_ENV);
        expect(app.config.LOG_LEVEL).toBe(env.LOG_LEVEL);
        expect(app.config.COOKIE_SECRET).toBe(env.COOKIE_SECRET);
        expect(app.config.DATABASE_URL).toBe(env.DATABASE_URL);
    });
});
