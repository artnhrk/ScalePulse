import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import buildApp from '../../../app.js';
import { StatusCode } from '../../../shared/constants/statusCodes.constant.js';

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
            url: '/health',
        });

        expect(res.statusCode).toBe(StatusCode.OK);
    });
});
