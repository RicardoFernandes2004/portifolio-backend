import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
    LoginUserDto,
    LoginUserResponseDto,
} from 'src/users/service/dtos/user.dto';
import { UsersService } from 'src/users/service/users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
        if (!loginUserDto.email && !loginUserDto.username) {
            throw new BadRequestException('email or username is required');
        }
        if (!loginUserDto.password) {
            throw new BadRequestException('password is required');
        }

        const user = await this.usersService.findByEmailOrUsername(
            loginUserDto.email,
            loginUserDto.username,
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(
            loginUserDto.password,
            user.password,
        );
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { token, expiresAt } = await this.usersService.issueTokenFor(user);

        return {
            user: user.toResponseDto(),
            token,
            tokenExpiresAt: expiresAt,
        };
    }
}
