import { describe, expect, it } from 'vitest';

import {
    baseHealthSchema,
    getHealthOptions,
} from '#modules/health/health.routes.options.js';

describe('Health Route Options (unit)', () => {
    it('should default to the base description when none is provided', () => {
        const options = getHealthOptions('Check Server Health');

        expect(options.schema.summary).toBe('Check Server Health');
        expect(options.schema.description).toBe(baseHealthSchema.description as string);
    });

    it('should use the provided description', () => {
        const options = getHealthOptions('Check Server Health', 'A custom description');

        expect(options.schema.description).toBe('A custom description');
    });
});
