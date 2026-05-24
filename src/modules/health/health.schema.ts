import { Type } from '@sinclair/typebox';

import { ServiceStatusEnum } from '#shared/enums/serviceStatus.enum.js';

export const healthResponseSchema = Type.Object({
    status: Type.String(),
    uptime: Type.Number(),
    timestamp: Type.Number(),
    services: Type.Optional(
        Type.Object({
            db: Type.Enum(ServiceStatusEnum),
        }),
    ),
});
