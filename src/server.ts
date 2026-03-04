import app from './app.js';

async function start() {
    await app.listen({ port: 6969 });

    // eslint-disable-next-line no-console
    console.log('Server started at http://localhost:6969');
}

await start();
