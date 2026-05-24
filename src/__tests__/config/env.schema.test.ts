import { Value } from '@sinclair/typebox/value';
import { describe, expect, it } from 'vitest';

import { portValidationSchema } from '#config/env.schema.js';

describe('portValidationSchema', () => {
    it('should decode a valid port', () => {
        const port = Value.Decode(portValidationSchema, '1234');
        expect(port).toBe(1234);
    });

    it('should encode a valid port', () => {
        const port = Value.Encode(portValidationSchema, 1234);
        expect(port).toBe('1234');
    });

    it('should throw an error for an invalid port', () => {
        expect(() => Value.Decode(portValidationSchema, 'invalid')).toThrow();
    });

    it('should throw an error when the port is out of range', () => {
        expect(() => Value.Decode(portValidationSchema, '0')).toThrow();
        expect(() => Value.Decode(portValidationSchema, '65536')).toThrow();
    });
});