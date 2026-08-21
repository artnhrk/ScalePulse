import { Type } from '@sinclair/typebox';

export const apiErrorResponseSchema = Type.Object({
    success: Type.Literal(false),
    error: Type.Object({
        code: Type.String(),
        message: Type.String(),
    }),
});
