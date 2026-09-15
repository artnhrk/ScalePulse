import pino from 'pino';

import { env } from '#config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

const logger = pino({
    level: env.LOG_LEVEL,

    base: {
        service: 'ScalePulse-API',
    },
    ...(isDevelopment
        ? {
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                  },
              },
          }
        : {}),
});

export default logger;
