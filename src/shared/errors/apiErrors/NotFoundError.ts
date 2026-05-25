import { StatusCode } from '#shared/constants/statusCodes.constant.js';

import { ApiError } from './ApiError.js';

export class NotFoundError extends ApiError {
    constructor(message = 'Resource Not Found') {
        super({
            statusCode: StatusCode.NOT_FOUND,
            message,
            code: 'NOT_FOUND',
        });
    }
}
