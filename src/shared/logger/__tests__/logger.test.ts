import type { LoggerOptions } from 'pino';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('pino', () => {
    return {
        default: vi.fn(() => {
            return {};
        }),
    };
});

const stubValidEnv = () => {
    vi.stubEnv('PORT', '3000');
    vi.stubEnv('LOG_LEVEL', 'info');
    vi.stubEnv(
        'COOKIE_SECRET',
        'thisisarandomcookiesecretstringtosurpassthe32characterlimit',
    );
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('REDIS_URI', 'redis://localhost:6379');
};

describe('shared logger', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        stubValidEnv();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    const getPinoOptions = async (): Promise<LoggerOptions> => {
        const { default: pino } = await import('pino');
        const pinoMock = vi.mocked(pino);

        await import('#shared/logger/logger.js');

        const options = pinoMock.mock.calls[0]?.[0];
        expect(options).toBeDefined();
        return options as unknown as LoggerOptions;
    };

    it('should create a logger with the configured level and service base', async () => {
        vi.stubEnv('LOG_LEVEL', 'debug');

        const options = await getPinoOptions();

        expect(options.level).toBe('debug');
        expect(options.base).toEqual({ service: 'ScalePulse-API' });
    });

    it('should configure the pino-pretty transport in development', async () => {
        vi.stubEnv('NODE_ENV', 'development');

        const options = await getPinoOptions();

        expect(options.transport).toEqual({
            target: 'pino-pretty',
            options: { colorize: true },
        });
    });

    it('should not configure a transport outside development', async () => {
        vi.stubEnv('NODE_ENV', 'production');

        const options = await getPinoOptions();

        expect(options.transport).toBeUndefined();
    });
});
