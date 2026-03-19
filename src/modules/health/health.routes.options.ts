import { StatusCode } from '../../shared/constants/statusCodes.constant.js';
import { healthResponseSchema } from './health.schema.js';

export const healthRoutesOptions = {
    schema: {
        tags: ['Health'],
        summary: 'Check health of the server',
        response: {
            [StatusCode.OK]: healthResponseSchema,
        },
    },
};
