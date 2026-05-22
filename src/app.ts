import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import scalar from '@scalar/fastify-api-reference';
import Fastify, { type FastifyInstance } from 'fastify';

import { generateRequestId } from './bootstrap/requestId.js';
import { env } from './config/env.js';
import prismaPlugin from './infra/database/prisma.plugin.js';
import healthModule from './modules/health/index.js';
import visitModule from './modules/visit/index.js';
import requestIdPlugin from './plugins/requestId.plugin.js';
import { REQUEST_ID_HEADER } from './shared/constants/headers.constant.js';

// build the fastify app
export default async function buildApp() {
    // create fastify instance with dynamic logger
    const app = Fastify({
        logger: {
            level: env.LOG_LEVEL,
        },
        requestIdHeader: REQUEST_ID_HEADER,
        genReqId: generateRequestId,
    });

    // enable cookie
    await app.register(fastifyCookie, {
        secret: env.COOKIE_SECRET,
    });

    // enable cors
    await app.register(fastifyCors, {
        origin: true,
    });

    // enable helmet
    await app.register(fastifyHelmet, {
        contentSecurityPolicy: false,
    });

    // enable swagger for documentations
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'ScalePulse',
                description: 'API documentation',
                version: '1.0.0',
            },
        },
    });

    if (env.NODE_ENV !== 'production') {
        await app.register(fastifySwaggerUi, {
            routePrefix: '/swagger',
        });
    }

    await app.register(scalar, {
        routePrefix: '/docs',
    });

    // register all plugins
    await app.register(requestIdPlugin);
    await app.register(prismaPlugin);

    // wrapping v1 apis in a plugin
    async function apiV1(app: FastifyInstance) {
        await app.register(healthModule);
        await app.register(visitModule, { prefix: '/visit' });
    }

    // register all/every version modules
    await app.register(apiV1, { prefix: '/api/v1' });

    return app;
}
