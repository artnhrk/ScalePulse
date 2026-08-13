import type { IncomingMessage } from 'node:http';

import { REQUEST_ID_HEADER } from '#shared/constants/headers.constant.js';

export const generateRequestId = (req: IncomingMessage) => {
    const requestId = req.headers[REQUEST_ID_HEADER];

    if (typeof requestId === 'string') {
        return requestId;
    }

    if (Array.isArray(requestId) && requestId.length > 0) {
        return requestId[0];
    }

    return crypto.randomUUID();
};
