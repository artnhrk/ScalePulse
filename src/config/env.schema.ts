import { type Static, Type } from '@sinclair/typebox';

import { LOG_LEVELS, NODE_ENVS } from './constants.js';

// define the server port validation constraint
export const portValidationSchema = Type.Transform(Type.String({ pattern: '^[0-9]+$' }))
    .Decode((value) => {
        const port = Number(value);

        if (port < 1 || port > 65535) {
            throw new Error('PORT must be between 1 and 65535');
        }

        return port;
    })
    .Encode((value) => String(value));

// validate the node environment
export const envVarValidationSchema = Type.Union(
    NODE_ENVS.map((env) => Type.Literal(env)),
);

// validate the log level
export const logLevelValidationSchema = Type.Union(
    LOG_LEVELS.map((level) => Type.Literal(level)),
    { default: 'info' },
);

// validate the cookie secret string
export const cookieSecretValidationSchema = Type.String({
    minLength: 32,
});

// validate the database connection url
export const databaseUrlValidationSchema = Type.String({
    pattern: '^postgres(ql)?://[^\\s]+$',
    description: 'PostgreSQL connection string',
});

// validate and define the env schema
export const envSchema = Type.Object({
    NODE_ENV: envVarValidationSchema,
    PORT: portValidationSchema,
    LOG_LEVEL: logLevelValidationSchema,
    COOKIE_SECRET: cookieSecretValidationSchema,
    DATABASE_URL: databaseUrlValidationSchema,
});

// define the env type
export type Env = Static<typeof envSchema>;
