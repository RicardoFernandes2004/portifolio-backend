import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { User } from 'src/users/domain/entity/user';
import type { CreateUserDto } from 'src/users/service/dtos/user.dto';
import { UserRepository } from 'src/users/infra/repositories/user.repository';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
    ) {}

    async create(dto: CreateUserDto): Promise<User> {
        if (!dto.email || !dto.username || !dto.password) {
            throw new BadRequestException('username, email and password are required');
        }

        const existing = await this.userRepository.findByEmailOrUsername(
            dto.email,
            dto.username,
        );
        if (existing) {
            throw new ConflictException('Email or username already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        const placeholderToken = `pending-${randomUUID()}`;
        const placeholderExpiresAt = new Date();

        const created = await this.userRepository.create({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
            jwtToken: placeholderToken,
            jwtTokenExpiresAt: placeholderExpiresAt,
        });

        const { token, expiresAt } = await this.signTokenFor(
            created.id,
            created.username,
        );

        const persisted = await this.userRepository.updateToken(
            created.id,
            token,
            expiresAt,
        );

        return User.fromPrisma(persisted);
    }

    async findByEmailOrUsername(
        email?: string,
        username?: string,
    ): Promise<User | null> {
        const row = await this.userRepository.findByEmailOrUsername(email, username);
        return row ? User.fromPrisma(row) : null;
    }

    async findById(id: number): Promise<User | null> {
        const row = await this.userRepository.findById(id);
        return row ? User.fromPrisma(row) : null;
    }

    async issueTokenFor(user: User): Promise<{ token: string; expiresAt: Date }> {
        const { token, expiresAt } = await this.signTokenFor(
            user.id,
            user.username,
        );
        await this.userRepository.updateToken(user.id, token, expiresAt);
        return { token, expiresAt };
    }

    private async signTokenFor(
        sub: number,
        username: string,
    ): Promise<{ token: string; expiresAt: Date }> {
        const token = await this.jwtService.signAsync({ sub, username });
        const decoded = this.jwtService.decode(token) as { exp?: number } | null;
        if (!decoded?.exp) {
            throw new Error('Issued JWT has no exp claim; check JWT_EXPIRES_IN');
        }
        return { token, expiresAt: new Date(decoded.exp * 1000) };
    }
}
