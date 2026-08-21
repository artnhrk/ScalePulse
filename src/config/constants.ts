/* Defining all constants and types */

// define the node environments list
export const NODE_ENVS = ['development', 'production', 'test', 'staging'] as const;

// define the log levels (supported by inbuilt-pino)
export const LOG_LEVELS = [
    'trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal',
    'silent',
] as const;
