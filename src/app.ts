import fastify from "fastify";

import type { FastifyRequest, FastifyReply } from "fastify";


// creating fastify instance
const app = fastify({
    logger: true,
});

app.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ statusCode: 200, message: "Server is up and running" });
});

export default app;
