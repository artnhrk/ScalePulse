import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv', () => {
    return {
        default: {
            config: vi.fn(),
        },
        config: vi.fn(),
    };
});

vi.mock('../../shared/errors/fatal.errors.js', () => ({
    __esModule: true,
    default: vi.fn(() => {
        throw new Error('fatal called');
    }),
}));

describe('env', () => {
    describe('dotenv loader', () => {
        beforeEach(() => {
            vi.resetModules();
            vi.clearAllMocks();

            // set environment variables so that they pass validation
            // in the dotenv loader when importing the env module
            vi.stubEnv('PORT', '3000');
            vi.stubEnv('LOG_LEVEL', 'info');
            vi.stubEnv(
                'COOKIE_SECRET',
                'thisisarandomcookiesecretstringtosurpassthe32characterlimit',
            );
        });

        it('should load ".env.test" when NODE_ENV is "test"', async () => {
            vi.stubEnv('NODE_ENV', 'test');

            const dotenv = await import('dotenv');
            await import('../../config/env.js');

            expect(dotenv.default.config).toHaveBeenCalledWith({
                path: '.env.test',
                quiet: true,
            });
        });

        it('should load ".env" when NODE_ENV is not "test"', async () => {
            vi.stubEnv('NODE_ENV', 'development');

            const dotenv = await import('dotenv');
            await import('../../config/env.js');

            expect(dotenv.default.config).toHaveBeenCalledWith();
        });
    });

    describe('validateEnv()', () => {
        const dummyNodeEnv = 'test';
        const dummyPort = '3000';
        const dummyLogLevel = 'info';
        const dummyCookieSecret =
            'thisisarandomcookiesecretstringtosurpassthe32characterlimit';

        beforeEach(() => {
            vi.resetModules();
            vi.clearAllMocks();
        });

        it('should parse and export valid env variables', async () => {
            vi.stubEnv('NODE_ENV', dummyNodeEnv);
            vi.stubEnv('PORT', dummyPort);
            vi.stubEnv('LOG_LEVEL', dummyLogLevel);
            vi.stubEnv('COOKIE_SECRET', dummyCookieSecret);

            const { env } = await import('../../config/env.js');

            expect(env.NODE_ENV).toBe(dummyNodeEnv);
            expect(env.PORT).toBe(Number(dummyPort));
            expect(env.LOG_LEVEL).toBe(dummyLogLevel);
            expect(env.COOKIE_SECRET).toBe(dummyCookieSecret);
        });

        it('should call fatal when env variables are invalid', async () => {
            vi.stubEnv('NODE_ENV', 'test');

            // set environment variables so that they fail validation
            vi.stubEnv('PORT', 'invalid');
            vi.stubEnv('LOG_LEVEL', 'invalid');
            vi.stubEnv('COOKIE_SECRET', 'invalid');

            const fatalModule = await import('../../shared/errors/fatal.errors.js');
            const fatal = fatalModule.default;

            // this file will also throw error because `Value.Decode` from TypeBox throws error
            // even if fatal is not mocked to throw error
            await expect(import('../../config/env.js')).rejects.toThrow();

            expect(fatal).toHaveBeenCalled();
        });

        it('should provide descriptive error messages for union types', async () => {
            vi.stubEnv('LOG_LEVEL', 'super-trace'); // invalid value

            const fatal = (await import('../../shared/errors/fatal.errors.js')).default;

            // this file will also throw error because `Value.Decode` from TypeBox throws error
            // even if fatal is not mocked to throw error
            await expect(import('../../config/env.js')).rejects.toThrow();

            // assert the content of the error message
            expect(fatal).toHaveBeenCalledWith(
                expect.stringContaining('Invalid environment variables'),
                expect.arrayContaining([
                    expect.stringContaining('Allowed values: trace, debug, info'),
                ]),
            );
        });
    });
});
