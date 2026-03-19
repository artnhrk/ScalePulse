import fp from 'fastify-plugin';

import { generateRequestId } from '../bootstrap/requestId.js';
import { REQUEST_ID_HEADER } from '../shared/constants/headers.constant.js';

export default fp(function requestIdPlugin(app) {
    app.decorateRequest('requestId', '');

    app.addHook('onRequest', async (req, reply) => {
        const id = generateRequestId(req.raw);
        req.id = id;
        reply.header(REQUEST_ID_HEADER, id);
    });
});
