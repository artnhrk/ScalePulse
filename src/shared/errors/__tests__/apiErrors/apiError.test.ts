import { describe, expect, it } from 'vitest';

import { ApiError } from '#shared/errors/apiErrors/ApiError.js';

describe('ApiError', () => {
    it('should create an error with statusCode and message', () => {
        const error = new ApiError({
            statusCode: 400,
            message: 'Bad Request',
        });

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ApiError');
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Bad Request');
    });

    it('should set the code when provided', () => {
        const error = new ApiError({
            statusCode: 404,
            message: 'Not Found',
            code: 'NOT_FOUND',
        });

        expect(error.code).toBe('NOT_FOUND');
    });

    it('should not set the code when not provided', () => {
        const error = new ApiError({
            statusCode: 400,
            message: 'Bad Request',
        });

        expect(error.code).toBeUndefined();
    });

    it('should set the details when provided', () => {
        const details = { field: 'email', reason: 'invalid format' };
        const error = new ApiError({
            statusCode: 422,
            message: 'Invalid data',
            details,
        });

        expect(error.details).toEqual(details);
    });

    it('should not set the details when not provided', () => {
        const error = new ApiError({
            statusCode: 400,
            message: 'Bad Request',
        });

        expect(error.details).toBeUndefined();
    });

    it('should preserve the custom statusCode and message when subclassed', () => {
        class CustomError extends ApiError {
            constructor() {
                super({
                    statusCode: 429,
                    message: 'Too Many Requests',
                    code: 'RATE_LIMITED',
                });
            }
        }

        const error = new CustomError();

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('CustomError');
        expect(error.statusCode).toBe(429);
        expect(error.message).toBe('Too Many Requests');
        expect(error.code).toBe('RATE_LIMITED');
    });
});
