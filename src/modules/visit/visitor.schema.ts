import { type Static, Type } from '@sinclair/typebox';

const SLUG_PATTERN = '^[a-z0-9_-]+$';
const EMAIL_PATTERN = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

export const visitParamsSchema = Type.Object(
    {
        username: Type.String({
            minLength: 1,
            maxLength: 200,
            pattern: SLUG_PATTERN,
        }),
        page: Type.String({
            minLength: 1,
            maxLength: 200,
            pattern: SLUG_PATTERN,
        }),
    },
    {
        additionalProperties: false,
    },
);

export type VisitParams = Static<typeof visitParamsSchema>;

export const registerBodySchema = Type.Object(
    {
        email: Type.String({ maxLength: 200, pattern: EMAIL_PATTERN }),
        count: Type.Optional(Type.Integer({ minimum: 1, maximum: 1_000_000_000 })),
        source: Type.Optional(Type.String({ maxLength: 200 })),
    },
    {
        additionalProperties: false,
    },
);

export const visitResponseSchema = Type.Object({
    username: Type.String(),
    page: Type.String(),
    count: Type.Integer(),
});

export const errorResponseSchema = Type.Object({
    username: Type.String(),
    page: Type.String(),
    message: Type.String(),
});
