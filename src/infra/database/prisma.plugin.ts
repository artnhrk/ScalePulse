import fp from 'fastify-plugin';

import prisma from '#infra/database/prisma.js';

export default fp((fastify) => {
    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
    });
});
