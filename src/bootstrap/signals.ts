import closeWithGrace from 'close-with-grace';

import type buildApp from '#app/app.js';

type AppInstance = Awaited<ReturnType<typeof buildApp>>;

export default function registerSignalHandler(app: AppInstance) {
    closeWithGrace(
        {
            delay: 15_000,
            logger: app.log,
            // crashes.ts already owns these via fatal()
            skip: ['uncaughtException', 'unhandledRejection', 'beforeExit'],
        },
        async ({ signal, err }) => {
            if (err) {
                app.log.error({ err }, 'Server closing due to error');
            } else {
                app.log.info({ signal }, 'Starting graceful shutdown...');
            }
            await app.close();
            app.log.info('Graceful shutdown complete');
        },
    );
}
