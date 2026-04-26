import { User } from "src/generated/prisma/client";
import { PrismaService } from "../../../../prisma/prisma.service";

export class UserRepository{

    constructor(private readonly prisma: PrismaService) {
        this.prisma = prisma;
    }

    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
    }

    async create(user: User): Promise<User> {
        return await this.prisma.user.create({
            data: user,
        });
    }
}