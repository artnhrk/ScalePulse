import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { ApiError } from './ApiError.js';

export class ConflictError extends ApiError {
    constructor(message = 'Conflict Occurred') {
        super({
            statusCode: StatusCode.CONFLICT,
            message,
            code: 'CONFLICT',
        });
    }
}
