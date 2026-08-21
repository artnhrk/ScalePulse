export interface IApiErrorOptions {
    statusCode: number;
    message: string;
    code?: string;
    details?: unknown;
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code?: string;
    public readonly details?: unknown;

    constructor({ statusCode, message, code, details }: IApiErrorOptions) {
        super(message);
        this.name = this.constructor.name;

        this.statusCode = statusCode;

        if (details !== undefined) {
            this.details = details;
        }

        if (code !== undefined) {
            this.code = code;
        }

        Error.captureStackTrace?.(this, this.constructor);
    }
}
