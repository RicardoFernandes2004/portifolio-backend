import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import type { User } from 'src/users/domain/entity/user';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
        return request.user;
    },
);
