import { describe, expect, it } from 'vitest';

import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { ApiError } from '#shared/errors/apiErrors/ApiError.js';
import { NotFoundError } from '#shared/errors/apiErrors/NotFoundError.js';

describe('NotFoundError', () => {
    it('should create an error with default message', () => {
        const error = new NotFoundError();

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('NotFoundError');
        expect(error.message).toBe('Resource Not Found');
        expect(error.statusCode).toBe(StatusCode.NOT_FOUND);
        expect(error.code).toBe('NOT_FOUND');
    });

    it('should create an error with a custom message', () => {
        const error = new NotFoundError('Page not found');

        expect(error.message).toBe('Page not found');
        expect(error.statusCode).toBe(StatusCode.NOT_FOUND);
        expect(error.code).toBe('NOT_FOUND');
    });
});
