import type buildApp from '#app/app.js';

// prevent multiple shutdown signal invocations
let shuttingDown = false;

type AppInstance = Awaited<ReturnType<typeof buildApp>>;

export default function registerSignalHandler(app: AppInstance) {
    // shutdown the server gracefully for cleanup purposes
    async function shutdown(signal: NodeJS.Signals) {
        if (shuttingDown) {
            app.log.warn({ signal }, 'Shutdown already in progress');
            return;
        }

        shuttingDown = true;
        app.log.info({ signal }, `Starting graceful shutdown...`);

        // force exit after 15 seconds to prevent hanging
        const timeout = setTimeout(() => {
            app.log.error('Shutdown timed out. Force exiting.');
            process.exit(1);
        }, 15_000);

        try {
            await app.close();
            app.log.info('Graceful Shutdown Complete.');
            clearTimeout(timeout);
            process.exit(0);
        } catch (error) {
            app.log.error(error, 'Error During Graceful Shutdown.');
            process.exit(1);
        }
    }

    // listen for termination signals
    process.on('SIGINT', (signal) => {
        void shutdown(signal);
    });

    process.on('SIGTERM', (signal) => {
        void shutdown(signal);
    });

    // force exit
    process.on('SIGQUIT', (signal) => {
        void shutdown(signal);
    });

    // nodemon / debugger / pm2 restart signal
    process.on('SIGUSR2', (signal) => {
        app.log.info('Received SIGUSR2 (restart signal)');
        void shutdown(signal);
    });
}
