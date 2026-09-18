import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { redisCtor, redisMock, errorMock } = vi.hoisted(() => {
    const handlers = new Map<string, Array<(payload?: unknown) => void>>();
    const redisMock = {
        on(event: string, listener: (payload?: unknown) => void) {
            if (!handlers.has(event)) {
                handlers.set(event, [listener]);
            }
        },
        emit(event: string, payload?: unknown) {
            for (const listener of handlers.get(event) ?? []) {
                listener(payload);
            }
        },
    };

    return {
        redisCtor: vi.fn((_uri: unknown, _options: unknown) => redisMock),
        redisMock,
        errorMock: vi.fn(),
    };
});

vi.mock('ioredis', () => ({
    Redis: vi.fn(function (this: unknown, uri: unknown, option: unknown) {
        redisCtor(uri, option);
        return redisMock;
    }),
}));

vi.mock('#shared/logger/logger.js', () => ({
    default: { error: errorMock },
}));

const stubValidEnv = () => {
    vi.stubEnv('PORT', '3000');
    vi.stubEnv('LOG_LEVEL', 'info');
    vi.stubEnv(
        'COOKIE_SECRET',
        'thisisarandomcookiesecretstringtosurpassthe32characterlimit',
    );
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('REDIS_URI', 'redis://localhost:6379');
};

interface RedisOptions {
    lazyConnect?: boolean;
    maxRetriesPerRequest?: number | null;
    connectTimeout?: number;
    enableOfflineQueue?: boolean;
    retryStrategy?: (times: number) => number | null;
}

const getOptions = () => redisCtor.mock.calls[0]?.[1] as RedisOptions | undefined;

describe('redis (unit)', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        (globalThis as { redis?: unknown }).redis = undefined;
        stubValidEnv();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should construct a client lazily using the REDIS_URI env variable', async () => {
        const { default: redis } = await import('#infra/redis/redis.js');

        expect(redis).toBeDefined();
        expect(redisCtor).toHaveBeenCalledTimes(1);
        expect(redisCtor.mock.calls[0]?.[0]).toBe('redis://localhost:6379');
    });

    it('should pass the expected connection options', async () => {
        await import('#infra/redis/redis.js');

        const options = getOptions();
        expect(options).toMatchObject({
            lazyConnect: true,
            maxRetriesPerRequest: null,
            connectTimeout: 5_000,
            enableOfflineQueue: false,
        });
        expect(options?.retryStrategy).toEqual(expect.any(Function));
    });

    it('should keep retrying to reconnect with a capped backoff', async () => {
        await import('#infra/redis/redis.js');

        const retryStrategy = getOptions()?.retryStrategy;
        expect(retryStrategy).toBeDefined();

        expect(retryStrategy?.(1)).toBe(100);
        expect(retryStrategy?.(10)).toBe(1_000);
        expect(retryStrategy?.(100)).toBe(5_000);
        expect(retryStrategy?.(1_000)).toBe(5_000);
        expect(retryStrategy?.(1_000)).not.toBeNull();
    });

    it('should log redis connection errors', async () => {
        await import('#infra/redis/redis.js');

        const err = new Error('connection refused');
        redisMock.emit('error', err);

        expect(errorMock).toHaveBeenCalledWith({ err }, 'Redis error');
    });

    it('should reuse the cached instance on subsequent imports', async () => {
        await import('#infra/redis/redis.js');
        await import('#infra/redis/redis.js');

        expect(redisCtor).toHaveBeenCalledTimes(1);
    });
});
