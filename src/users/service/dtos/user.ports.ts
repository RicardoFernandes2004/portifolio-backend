import type { User } from "src/generated/prisma/client";

export interface PersistUserData {
    username: string;
    email: string;
    password: string;
    jwtToken: string;
    jwtTokenExpiresAt: Date;
}

/**
 * Campos sensíveis do usuário, todos opcionais: um único método de update cobre
 * troca de senha, enrolamento de 2FA, consumo de código de backup, emissão de
 * token de reset e revogação de sessão. `undefined` não toca a coluna.
 */
export interface UpdateUserSecurityData {
    password?: string;
    jwtToken?: string;
    jwtTokenExpiresAt?: Date;
    twoFactorSecret?: string | null;
    twoFactorEnabledAt?: Date | null;
    twoFactorBackupCodes?: string[];
    passwordResetTokenHash?: string | null;
    passwordResetExpiresAt?: Date | null;
}

export interface UserRepositoryPort {
    findByEmailOrUsername(email?: string, username?: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPasswordResetTokenHash(hash: string): Promise<User | null>;
    create(data: PersistUserData): Promise<User>;
    updateToken(id: number, jwtToken: string, jwtTokenExpiresAt: Date): Promise<User>;
    updateSecurity(id: number, data: UpdateUserSecurityData): Promise<User>;
}
