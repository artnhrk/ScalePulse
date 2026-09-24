import fp from 'fastify-plugin';

import createRedis from '#infra/redis/redis.js';

export default fp(async (fastify) => {
    const redis = createRedis();

    await redis.connect();

    fastify.decorate('redis', redis);

    fastify.log.info('Redis connected');

    fastify.addHook('onClose', async () => {
        if (redis.status !== 'end') {
            await redis.quit();

            fastify.log.info('Redis connection closed');
        }
    });
});
