import { describe, expect, it } from 'vitest';

import { getUserOptions } from '#modules/user/user.routes.options.js';

describe('User Route Options (unit)', () => {
    it('should default to the register summary when none is provided', () => {
        const options = getUserOptions();

        expect(options.summary).toBe('Register a user page for tracking');
    });

    it('should use the provided summary', () => {
        const options = getUserOptions('Custom User Registration Summary');

        expect(options.summary).toBe('Custom User Registration Summary');
    });
});
