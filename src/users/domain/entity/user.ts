import type { User as PrismaUser } from "src/generated/prisma/client";
import type { UserResponseDto } from "src/users/service/dtos/user.dto";

export class User {
    private constructor(private readonly props: PrismaUser) {}

    static fromPrisma(row: PrismaUser): User {
        return new User(row);
    }

    get id(): number {
        return this.props.id;
    }

    get username(): string {
        return this.props.username;
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }

    get jwtToken(): string {
        return this.props.jwtToken;
    }

    get jwtTokenExpiresAt(): Date {
        return this.props.jwtTokenExpiresAt;
    }

    get jwtTokenCreatedAt(): Date {
        return this.props.jwtTokenCreatedAt;
    }

    get jwtTokenUpdatedAt(): Date {
        return this.props.jwtTokenUpdatedAt;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): UserResponseDto {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
