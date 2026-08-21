import { Value } from '@sinclair/typebox/value';
import dotenv from 'dotenv';

import { envSchema } from '#config/env.schema.js';
import fatal from '#shared/errors/fatal.errors.js';


if (process.env['NODE_ENV'] === 'test') {
    dotenv.config({ path: '.env.test', quiet: true });
} else if (process.env['NODE_ENV'] !== 'production') {
    dotenv.config();
}

function validateEnv() {
    const env = process.env;

    const errors = [...Value.Errors(envSchema, env)];

    if (errors.length > 0) {
        const messages = errors.map((err) => {
            const key = err.path.replace('/', '');
            if (
                typeof err.schema === 'object' &&
                err.schema !== null &&
                'anyOf' in err.schema &&
                Array.isArray((err.schema as unknown as { anyOf: unknown[] }).anyOf)
            ) {
                const unionSchema = err.schema as unknown as {
                    anyOf: { const?: string }[];
                };

                const allowed = unionSchema.anyOf
                    .map((s) => s.const)
                    .filter((v): v is string => typeof v === 'string')
                    .join(', ');

                return `${key} -> invalid value "${err.value as string}". Allowed values: ${allowed}`;
            }
            return `${key} -> ${err.message}`;
        });

        fatal('Invalid environment variables', messages);
    }

    const castedEnv = Value.Decode(envSchema, env);
    return castedEnv;
}

export const env = Object.freeze({ ...validateEnv() });
