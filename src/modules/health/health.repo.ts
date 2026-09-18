import type { PrismaClient } from '@prisma/client';
import type { Redis } from 'ioredis';

export class HealthRepository {
    private readonly prisma: PrismaClient;
    private readonly redis: Redis;

    constructor({ prisma, redis }: { prisma: PrismaClient; redis: Redis }) {
        this.prisma = prisma;
        this.redis = redis;
    }

    async checkDb() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
    async checkRedis() {
        try {
            const res = await this.redis.ping();
            return res === 'PONG';
        } catch {
            return false;
        }
    }
}
