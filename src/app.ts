import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import type { FastifyRequest, FastifyReply } from "fastify";


// creating fastify instance
const app = fastify({
    logger: true,
});

// registering required plugins
app.register(cors);
app.register(helmet);

// all routes
app.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ statusCode: 200, message: "Server is up and running" });
});

export default app;
