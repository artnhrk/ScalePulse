import fp from 'fastify-plugin';

import redis from '#infra/redis/redis.js';

export default fp((fastify) => {
    fastify.decorate('redis', redis);
    fastify.addHook('onClose', async () => {
        await redis.quit();
    });
});
