import fatal from '../shared/errors/fatal.errors.js';

export default function registerCrashHandler() {
    // crash handlers
    process.on('unhandledRejection', (reason) => {
        fatal(
            'Unhandled Promise Rejection',
            reason instanceof Error ? [reason.stack ?? reason.message] : [String(reason)],
        );
    });

    process.on('uncaughtException', (error) => {
        fatal('Uncaught Exception', [error.stack ?? error.message]);
    });
}
