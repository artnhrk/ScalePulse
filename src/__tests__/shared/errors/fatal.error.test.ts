import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import fatal from '#shared/errors/fatal.errors.js';

describe('fatal()', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit');

    const errMsgForFatal = 'process.exit called';

    beforeAll(() => {
        vi.clearAllMocks();

        exitSpy.mockImplementation((() => {
            throw new Error(errMsgForFatal);
        }) as never);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
        exitSpy.mockRestore();
    });

    it('should log the message and exit the process', () => {
        const errorMessage = 'something went wrong';
        expect(() => {
            fatal(errorMessage);
        }).toThrow(errMsgForFatal);

        expect(consoleSpy).toHaveBeenCalledWith(`\n❌ ${errorMessage} ❌\n`);
        expect(consoleSpy).toHaveBeenCalledWith('');
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('should log details when provided', () => {
        const details = ['PORT is missing', 'LOG_LEVEL invalid'];

        const errorMessage = 'Invalid environment variables';

        expect(() => {
            fatal(errorMessage, details);
        }).toThrow(errMsgForFatal);

        expect(consoleSpy).toHaveBeenCalledWith(`\n❌ ${errorMessage} ❌\n`);
        expect(consoleSpy).toHaveBeenCalledWith(`  • ${details[0]}`);
        expect(consoleSpy).toHaveBeenCalledWith(`  • ${details[1]}`);
        expect(consoleSpy).toHaveBeenCalledWith('');
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});