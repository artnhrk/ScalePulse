import type { IncomingMessage } from 'node:http';

import { REQUEST_ID_HEADER } from '#shared/constants/headers.constant.js';

export const generateRequestId = (req: IncomingMessage): string => {
    const requestId = req.headers[REQUEST_ID_HEADER];

    if (typeof requestId === 'string') {
        return requestId;
    }

    if (Array.isArray(requestId) && requestId.length > 0) {
        const firstId = requestId[0];
        if (firstId !== undefined) {
            return firstId;
        }
    }

    return crypto.randomUUID();
};
