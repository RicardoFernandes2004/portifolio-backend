import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    LoginUserDto,
    LoginUserResponseDto,
} from 'src/users/service/dtos/user.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login do administrador',
        description:
            'Recebe email OU username + password. Retorna o usuário, JWT bearer e expiração. Tokens são rotacionados a cada login (o anterior é revogado).',
    })
    @ApiBody({ type: LoginUserDto })
    @ApiOkResponse({ type: LoginUserResponseDto })
    @ApiBadRequestResponse({
        description: 'email/username ou password ausentes',
    })
    @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
    async login(@Body() dto: LoginUserDto): Promise<LoginUserResponseDto> {
        return this.authService.login(dto);
    }
}
