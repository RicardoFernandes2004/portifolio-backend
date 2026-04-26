import type { User } from "src/generated/prisma/client";

export interface PersistUserData {
    username: string;
    email: string;
    password: string;
    jwtToken: string;
    jwtTokenExpiresAt: Date;
}

export interface UserRepositoryPort {
    findByEmailOrUsername(email?: string, username?: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(data: PersistUserData): Promise<User>;
    updateToken(id: number, jwtToken: string, jwtTokenExpiresAt: Date): Promise<User>;
}
