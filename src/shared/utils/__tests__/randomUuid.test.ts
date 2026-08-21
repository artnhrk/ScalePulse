import { uuidv7 } from 'uuidv7';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { randomUuid } from '#shared/utils/randomUuid.utils.js';

vi.mock('uuidv7', () => ({
    uuidv7: vi.fn(() => 'mock-uuid'),
}));

const uuidv7Mock = vi.mocked(uuidv7);

describe('randomUuid()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return the generated uuid by uuidv7', () => {
        expect(randomUuid()).toBe('mock-uuid');
        expect(uuidv7Mock).toHaveBeenCalledTimes(1);
    });
});
