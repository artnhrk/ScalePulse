import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import redisPlugin from '#infra/redis/redis.plugin.js';

const { redisMock } = vi.hoisted(() => ({
    redisMock: { status: 'wait', quit: vi.fn() },
}));

vi.mock('#infra/redis/redis.js', () => ({
    default: redisMock,
}));

describe('redis plugin (unit)', () => {
    beforeEach(() => {
        redisMock.status = 'wait';
        redisMock.quit.mockClear();
    });

    it('should decorate the fastify instance with the redis client', async () => {
        const app = Fastify();
        await app.register(redisPlugin);

        expect(app.redis).toBe(redisMock);

        await app.close();
    });

    it('should gracefully quit the redis client on close when it is connected', async () => {
        const app = Fastify();
        await app.register(redisPlugin);
        redisMock.status = 'ready';

        await app.close();

        expect(redisMock.quit).toHaveBeenCalledTimes(1);
    });

    it('should not quit the redis client on close when it is not connected', async () => {
        const app = Fastify();
        await app.register(redisPlugin);

        await app.close();

        expect(redisMock.quit).not.toHaveBeenCalled();
    });
});
