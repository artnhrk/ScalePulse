import type { PrismaClient } from '@prisma/client';

export class UserRepository {
    constructor(private prisma: PrismaClient) {}

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }
}
