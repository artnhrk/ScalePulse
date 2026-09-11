import { Redis } from 'ioredis';

import { env } from '#config/env.js';
import logger from '#shared/logger/logger.js';

export default function createRedis(): Redis {
    const redis = new Redis(env.REDIS_URI, {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        connectTimeout: 5_000,
        enableOfflineQueue: false,
        retryStrategy: (times) => Math.min(times * 100, 5_000),
    });

    redis.on('error', (err) => logger.error({ err }, 'Redis error'));

    return redis;
}
