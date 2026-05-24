import type { IncomingMessage } from 'http';
import { describe, expect, it, vi } from 'vitest';

import { generateRequestId } from '#bootstrap/requestId.js';
import { REQUEST_ID_HEADER } from '#shared/constants/headers.constant.js';

describe('generateRequestId()', () => {
    const dummyRequestId = 'dummy-request-id-69';

    it('should return requestId when present in header', () => {
        const req = {
            headers: {
                [REQUEST_ID_HEADER]: dummyRequestId,
            },
        } as unknown as IncomingMessage;

        const requestId = generateRequestId(req);

        expect(requestId).toBe(dummyRequestId);
    });

    it('should return the first requestId when array of requestId is present in header', () => {
        const req = {
            headers: {
                [REQUEST_ID_HEADER]: [dummyRequestId, 'if-extra-req-id'],
            },
        } as unknown as IncomingMessage;

        const requestId = generateRequestId(req);

        expect(requestId).toBe(dummyRequestId);
    });

    it('should generate a UUID string when header is missing', () => {
        const dummyUUID = crypto.randomUUID();
        const uuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(dummyUUID);

        const req = {
            headers: {},
        } as unknown as IncomingMessage;

        const requestId = generateRequestId(req);

        expect(requestId).toBe(dummyUUID);
        expect(uuidSpy).toHaveBeenCalled();
    });
});
