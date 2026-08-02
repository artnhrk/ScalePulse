import { type Static, Type } from '@sinclair/typebox';

import { EMAIL_PATTERN, SLUG_PATTERN } from '#shared/constants/patterns.constant.js';

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
export const emailSchema = Type.String({ maxLength: 200, pattern: EMAIL_PATTERN });
export const countSchema = Type.Integer({ minimum: 0, maximum: 1_000_000_000 });
export const sourceSchema = Type.String({ maxLength: 200 });

export const registerBodySchema = Type.Object(
    {
        username: usernameSchema,
        page: pageSchema,
        email: emailSchema,
        count: Type.Optional(countSchema),
        source: Type.Optional(sourceSchema),
    },
    {
        additionalProperties: false,
    },
);

export type IRegisterBody = Static<typeof registerBodySchema>;

export const registerResponseSchema = Type.Object({
    username: usernameSchema,
    page: pageSchema,
    email: emailSchema, // email is required for later migrations without braking
    count: countSchema, // this will be visible to everyone, [for migrations from other platforms]
    source: Type.Union([sourceSchema, Type.Null()]), // this will be visible to everyone, [for transparency from other platforms]
});
