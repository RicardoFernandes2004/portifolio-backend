import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { User } from 'src/users/domain/entity/user';
import { UsersService } from 'src/users/service/users/users.service';

interface JwtPayload {
    sub: number;
    username: string;
}

export interface AuthenticatedRequest extends Request {
    user: User;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractBearerToken(request);
        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        let payload: JwtPayload;
        try {
            payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: process.env.JWT_SECRET,
            });
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        if (user.jwtToken !== token) {
            throw new UnauthorizedException('Token has been revoked');
        }

        if (user.jwtTokenExpiresAt.getTime() <= Date.now()) {
            throw new UnauthorizedException('Token expired');
        }

        (request as AuthenticatedRequest).user = user;
        return true;
    }

    private extractBearerToken(request: Request): string | null {
        const header = request.headers['authorization'];
        if (!header || typeof header !== 'string') return null;
        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) return null;
        return token;
    }
}
