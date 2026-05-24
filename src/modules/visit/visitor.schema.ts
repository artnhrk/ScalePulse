import { type Static, Type } from '@sinclair/typebox';

const SLUG_PATTERN = '^[a-zA-Z0-9_-]+$';

export const visitParamsSchema = Type.Object({
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
});

export type VisitParams = Static<typeof visitParamsSchema>;

export const setInitialCountBodySchema = Type.Object({
    count: Type.Integer({ minimum: 1, maximum: 1_000_000_000 }),
    source: Type.String({ maxLength: 200 }),
});

export const visitResponseSchema = Type.Object({});
