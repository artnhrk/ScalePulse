import Fastify from 'fastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import redisPlugin from '#infra/redis/redis.plugin.js';

const { createRedisMock, redisMock } = vi.hoisted(() => {
    const redisMock = {
        status: 'wait',
        connect: vi.fn(),
        quit: vi.fn(),
    };

    return {
        createRedisMock: vi.fn(() => redisMock),
        redisMock,
    };
});

vi.mock('#infra/redis/redis.js', () => ({
    default: createRedisMock,
}));

describe('redis plugin (unit)', () => {
    beforeEach(() => {
        redisMock.status = 'wait';
        redisMock.connect.mockClear();
        redisMock.quit.mockClear();
        createRedisMock.mockClear();
    });

    it('should create a client and decorate the fastify instance with it', async () => {
        const app = Fastify();
        await app.register(redisPlugin);

        expect(createRedisMock).toHaveBeenCalledTimes(1);
        expect(redisMock.connect).toHaveBeenCalledTimes(1);
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

    it('should not quit the redis client on close when it is already ended', async () => {
        const app = Fastify();
        await app.register(redisPlugin);
        redisMock.status = 'end';

        await app.close();

        expect(redisMock.quit).not.toHaveBeenCalled();
    });
});
