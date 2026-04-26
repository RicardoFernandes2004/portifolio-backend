import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto, LoginUserResponseDto } from 'src/users/service/dtos/user.dto';
import { UsersService } from 'src/users/service/users/users.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) { }
    async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
        const user = await this.usersService.findByEmailOrUsername(loginUserDto.email, loginUserDto.username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (user.password !== loginUserDto.password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return {
            user: user.toResponseDto(),
            token: user.jwtToken,
            tokenExpiresAt: user.jwtTokenExpiresAt.toISOString(),
        };
    }
}
