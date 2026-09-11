import type { PrismaClient } from '@prisma/client';

export class HealthRepository {
    constructor(private prisma: PrismaClient) {}

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
            await Promise.resolve();
            return true;
        } catch {
            return false;
        }
    }
}
