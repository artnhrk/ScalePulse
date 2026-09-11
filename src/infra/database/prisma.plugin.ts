import fp from 'fastify-plugin';

import createPrismaClient from '#infra/database/prisma.js';

export default fp(async (fastify) => {
    const { prisma, pool } = createPrismaClient();

    await prisma.$connect();

    fastify.decorate('prisma', prisma);

    fastify.log.info('Prisma connected to PostgreSQL');

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
        await pool.end();
        fastify.log.info('Prisma disconnected from PostgreSQL');
    });
});
