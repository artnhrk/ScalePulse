import { Redis } from 'ioredis';

import { env } from '#config/env.js';

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

const redis =
    globalForRedis.redis ??
    new Redis(env.REDIS_URI, {
        lazyConnect: true,
        maxRetriesPerRequest: null,
    });

// eslint-disable-next-line no-console
redis.on('error', (err) => console.error('Redis error:', err));

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
