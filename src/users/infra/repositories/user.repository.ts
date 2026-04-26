import { Injectable } from "@nestjs/common";
import type { User } from "src/generated/prisma/client";
import type {
    PersistUserData,
    UserRepositoryPort,
} from "src/users/service/dtos/user.ports";
import { PrismaService } from "../../../../prisma/prisma.service";

@Injectable()
export class UserRepository implements UserRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findByEmailOrUsername(
        email?: string,
        username?: string,
    ): Promise<User | null> {
        const or: Array<{ email?: string; username?: string }> = [];
        if (email) or.push({ email });
        if (username) or.push({ username });
        if (or.length === 0) return null;

        return this.prisma.user.findFirst({ where: { OR: or } });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: PersistUserData): Promise<User> {
        return this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: data.password,
                jwtToken: data.jwtToken,
                jwtTokenExpiresAt: data.jwtTokenExpiresAt,
            },
        });
    }

    async updateToken(
        id: number,
        jwtToken: string,
        jwtTokenExpiresAt: Date,
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: { jwtToken, jwtTokenExpiresAt },
        });
    }
}
