import fp from 'fastify-plugin';

import { REQUEST_ID_HEADER } from '#shared/constants/headers.constant.js';

export default fp(function requestIdPlugin(app) {
    app.addHook('onRequest', async (req, reply) => {
        reply.header(REQUEST_ID_HEADER, req.id);
    });
});
