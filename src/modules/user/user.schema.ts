import { type Static, Type } from '@sinclair/typebox';

import { EMAIL_PATTERN, SLUG_PATTERN } from '#shared/constants/patterns.constant.js';

export const emailSchema = Type.String({ maxLength: 200, pattern: EMAIL_PATTERN });
export const usernameSchema = Type.String({
    minLength: 1,
    maxLength: 200,
    pattern: SLUG_PATTERN,
});
export const pageSchema = Type.String({
    minLength: 1,
    maxLength: 200,
    pattern: SLUG_PATTERN,
});
export const countSchema = Type.Integer({ minimum: 1, maximum: 1_000_000_000 });
export const sourceSchema = Type.Optional(Type.String({ maxLength: 200 }));

export const registerBodySchema = Type.Object(
    {
        username: usernameSchema,
        page: pageSchema,
        email: emailSchema,
        count: countSchema,
        source: sourceSchema,
    },
    {
        additionalProperties: false,
    },
);

export type RegisterBody = Static<typeof registerBodySchema>;

export const registerResponseSchema = Type.Object({
    username: usernameSchema,
    page: pageSchema,
    email: emailSchema,
    count: countSchema,
    source: sourceSchema,
});

export const errorResponseSchema = Type.Object({
    username: usernameSchema,
    page: pageSchema,
    message: Type.String(),
});
