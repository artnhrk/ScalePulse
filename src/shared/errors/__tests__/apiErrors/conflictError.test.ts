import { describe, expect, it } from 'vitest';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { ApiError } from '#shared/errors/apiErrors/ApiError.js';
import { ConflictError } from '#shared/errors/apiErrors/ConflictError.js';

describe('ConflictError', () => {
    it('should create an error with default message', () => {
        const error = new ConflictError();

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ConflictError');
        expect(error.message).toBe('Conflict Occurred');
        expect(error.statusCode).toBe(StatusCode.CONFLICT);
        expect(error.code).toBe('CONFLICT');
    });

    it('should create an error with a custom message', () => {
        const error = new ConflictError('Username already taken');

        expect(error.message).toBe('Username already taken');
        expect(error.statusCode).toBe(StatusCode.CONFLICT);
        expect(error.code).toBe('CONFLICT');
    });
});
