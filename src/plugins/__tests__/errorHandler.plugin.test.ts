import { Prisma } from '@prisma/client';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import errorHandlerPlugin from '#plugins/errorHandler.plugin.js';
import { StatusCode } from '#shared/constants/statusCodes.constant.js';
import { ConflictError } from '#shared/errors/apiErrors/ConflictError.js';

interface IValidationErrorResponse {
    success: boolean;
    error: {
        code: string;
        message: string;
        details: Array<{ field: string; message: string }>;
    };
}

describe('Error Handler Plugin', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = Fastify({ logger: false });
        await app.register(errorHandlerPlugin);

        app.get('/api-error', () => {
            throw new ConflictError('Conflict Occurred');
        });

        app.get('/prisma-error', () => {
            throw new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`email`)',
                {
                    code: 'P2002',
                    clientVersion: '7.6.0',
                    meta: { target: ['email'] },
                },
            );
        });

        app.get('/generic-error', () => {
            throw new Error('boom');
        });

        app.get('/validation-without-details', () => {
            const error = new Error('custom validation error') as FastifyError;
            Object.defineProperty(error, 'validation', {
                value: undefined,
                configurable: true,
            });
            throw error;
        });

        app.post(
            '/validation',
            {
                schema: {
                    body: {
                        type: 'object',
                        required: ['name'],
                        properties: { name: { type: 'string' } },
                        additionalProperties: false,
                    },
                },
            },
            () => ({ ok: true }),
        );
    });

    afterAll(async () => {
        await app.close();
    });

    it('should respond with the ApiError statusCode and message', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api-error',
        });

        expect(res.statusCode).toBe(StatusCode.CONFLICT);
        expect(res.json()).toEqual({
            success: false,
            error: {
                code: 'CONFLICT',
                message: 'Conflict Occurred',
            },
        });
    });

    it('should respond with 409 for a prisma unique constraint error', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/prisma-error',
        });

        expect(res.statusCode).toBe(StatusCode.CONFLICT);
        expect(res.json()).toEqual({
            success: false,
            error: {
                code: 'CONFLICT',
                message: 'Resource already exists',
            },
        });
    });

    it('should respond with validation details for a schema validation error', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/validation',
            headers: { 'content-type': 'application/json' },
            payload: {},
        });

        const body = res.json<IValidationErrorResponse>();

        expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('VALIDATION_ERROR');
        expect(body.error.message).toBe('Invalid request data');
        expect(body.error.details).toHaveLength(1);
        expect(body.error.details[0]?.field).toBe('body');
        expect(body.error.details[0]?.message).toContain('name');
    });

    it('should respond with empty details when validation is missing', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/validation-without-details',
        });

        expect(res.statusCode).toBe(StatusCode.BAD_REQUEST);
        expect(res.json()).toEqual({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: [],
            },
        });
    });

    it('should respond with 500 for a generic error', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/generic-error',
        });

        expect(res.statusCode).toBe(StatusCode.INTERNAL_SERVER_ERROR);
        expect(res.json()).toEqual({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something Went Wrong',
            },
        });
    });

    it('should preserve the statusCode of a fastify error', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/validation',
            headers: { 'content-type': 'application/xml' },
            payload: '<name>foo</name>',
        });

        expect(res.statusCode).toBe(StatusCode.UNSUPPORTED_MEDIA_TYPE);
        expect(res.json()).toEqual({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something Went Wrong',
            },
        });
    });
});
