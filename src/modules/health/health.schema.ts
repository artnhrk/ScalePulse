import { Type } from '@sinclair/typebox';

export const healthResponseSchema = Type.Object({
    status: Type.String(),
    uptime: Type.Number(),
    timestamp: Type.Number(),
});
