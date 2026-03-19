import buildApp from './app.js';
import registerCrashHandler from './bootstrap/crashes.js';
import registerSignalHandler from './bootstrap/signals.js';
import { env } from './config/env.js';
import fatal from './shared/errors/fatal.errors.js';

async function startServer() {
    const app = await buildApp();

    // register signal and crash handlers
    registerSignalHandler(app);
    registerCrashHandler();

    try {
        await app.listen({
            port: env.PORT,
            host: '0.0.0.0',
        });
        app.log.info({ port: env.PORT, env: env.NODE_ENV }, 'ScalePulse server started!');
    } catch (error) {
        app.log.fatal(error);
        process.exit(1);
    }
}

startServer().catch((err) => {
    fatal(
        'Fatal startup error',
        err instanceof Error ? [err.stack ?? err.message] : [String(err)],
    );
});
