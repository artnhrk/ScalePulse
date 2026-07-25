import { type Static, Type } from '@sinclair/typebox';

import { SLUG_PATTERN } from '#shared/constants/patterns.constant.js';

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

export const visitResponseSchema = Type.Object({
    username: Type.String(),
    page: Type.String(),
    count: Type.Integer(),
});
