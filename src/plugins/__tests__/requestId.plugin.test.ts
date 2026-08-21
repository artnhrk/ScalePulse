import Fastify, { type FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import requestIdPlugin from '#plugins/requestId.plugin.js';
import { REQUEST_ID_HEADER } from '#shared/constants/headers.constant.js';

describe('RequestId Plugin', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify({ logger: false, requestIdHeader: REQUEST_ID_HEADER });
        await app.register(requestIdPlugin);

        app.get('/ping', () => ({ pong: true }));
    });

    afterAll(async () => {
        await app.close();
    });

    it('should set the request ID response header', async () => {
        const requestId = 'dummy-request-id';

        const res = await app.inject({
            method: 'GET',
            url: '/ping',
            headers: { [REQUEST_ID_HEADER]: requestId },
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers[REQUEST_ID_HEADER.toLowerCase()]).toBe(requestId);
    });

    it('should set a generated request ID when the request ID header is missing', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/ping',
        });

        expect(res.statusCode).toBe(200);

        const requestId = res.headers[REQUEST_ID_HEADER.toLowerCase()];

        expect(requestId).toEqual(expect.any(String));
        expect(requestId).not.toBe('');
    });
});
