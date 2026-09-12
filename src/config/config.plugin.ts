import fp from 'fastify-plugin';

import { env } from '#config/env.js';

export default fp((fastify) => {
    fastify.decorate('config', env);
});
