import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
    LoginUserDto,
    LoginUserResponseDto,
    UserResponseDto,
} from 'src/users/service/dtos/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { AuthService, type LoginResult } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import { TwoFactorService } from '../services/two-factor.service';
import {
    BackupCodesResponseDto,
    DisableTwoFactorDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    TwoFactorCodeDto,
    TwoFactorLoginDto,
    TwoFactorSetupResponseDto,
} from '../services/dtos/auth.dto';

/** Rotas não autenticadas apanham brute force: limite curto em todas elas. */
const AUTH_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly twoFactorService: TwoFactorService,
        private readonly passwordResetService: PasswordResetService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @Throttle(AUTH_THROTTLE)
    @ApiOperation({
        summary: 'Login do administrador (primeiro fator)',
        description:
            'Com 2FA desligado devolve a sessão direto. Com 2FA ligado devolve { twoFactorRequired, challengeToken } e NENHUMA sessão — conclua em /auth/login/2fa.',
    })
    @ApiBody({ type: LoginUserDto })
    @ApiOkResponse({ type: LoginUserResponseDto })
    @ApiBadRequestResponse({ description: 'email/username ou password ausentes' })
    @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
    async login(@Body() dto: LoginUserDto): Promise<LoginResult> {
        return this.authService.login(dto);
    }

    @Post('login/2fa')
    @HttpCode(HttpStatus.OK)
    @UseGuards(ThrottlerGuard)
    @Throttle(AUTH_THROTTLE)
    @ApiOperation({
        summary: 'Login do administrador (segundo fator)',
        description: 'Aceita TOTP de 6 dígitos ou código de backup de uso único.',
    })
    @ApiOkResponse({ type: LoginUserResponseDto })
    @ApiUnauthorizedResponse({ description: 'Challenge ou código inválido' })
    async loginTwoFactor(
        @Body() dto: TwoFactorLoginDto,
    ): Promise<LoginUserResponseDto> {
        return this.authService.completeTwoFactorLogin(
            dto.challengeToken,
            dto.code,
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Usuário da sessão atual',
        description: 'Inclui se o 2FA está ativo. Nunca expõe segredo nem códigos.',
    })
    @ApiOkResponse({ type: UserResponseDto })
    me(@Req() req: AuthenticatedRequest): UserResponseDto {
        return req.user.toResponseDto();
    }

    @Post('2fa/setup')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Iniciar enrolamento do 2FA',
        description:
            'Gera o segredo e devolve a URI otpauth. NÃO ativa o 2FA: confirme em /auth/2fa/enable.',
    })
    @ApiOkResponse({ type: TwoFactorSetupResponseDto })
    async setupTwoFactor(
        @Req() req: AuthenticatedRequest,
    ): Promise<TwoFactorSetupResponseDto> {
        return this.twoFactorService.startEnrollment(req.user);
    }

    @Post('2fa/enable')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Ativar o 2FA',
        description:
            'Confirma o enrolamento e devolve os códigos de backup. Eles não são exibidos de novo.',
    })
    @ApiOkResponse({ type: BackupCodesResponseDto })
    @ApiUnauthorizedResponse({ description: 'Código inválido' })
    async enableTwoFactor(
        @Req() req: AuthenticatedRequest,
        @Body() dto: TwoFactorCodeDto,
    ): Promise<BackupCodesResponseDto> {
        return this.twoFactorService.enable(req.user, dto.code);
    }

    @Post('2fa/disable')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Desativar o 2FA',
        description: 'Exige senha atual E segundo fator.',
    })
    @ApiNoContentResponse()
    @ApiUnauthorizedResponse({ description: 'Senha ou código inválido' })
    async disableTwoFactor(
        @Req() req: AuthenticatedRequest,
        @Body() dto: DisableTwoFactorDto,
    ): Promise<void> {
        await this.twoFactorService.disable(req.user, dto.password, dto.code);
    }

    @Post('2fa/backup-codes')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Gerar novos códigos de backup',
        description: 'Invalida todos os códigos anteriores.',
    })
    @ApiOkResponse({ type: BackupCodesResponseDto })
    async regenerateBackupCodes(
        @Req() req: AuthenticatedRequest,
        @Body() dto: TwoFactorCodeDto,
    ): Promise<BackupCodesResponseDto> {
        return this.twoFactorService.regenerateBackupCodes(req.user, dto.code);
    }

    @Post('password/forgot')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    @Throttle(AUTH_THROTTLE)
    @ApiOperation({
        summary: 'Pedir link de redefinição de senha',
        description:
            'Responde 204 exista ou não o email — diferenciar permitiria enumerar contas.',
    })
    @ApiNoContentResponse()
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
        await this.passwordResetService.requestReset(dto.email);
    }

    @Post('password/reset')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ThrottlerGuard)
    @Throttle(AUTH_THROTTLE)
    @ApiOperation({
        summary: 'Concluir redefinição de senha',
        description:
            'Token de uso único, válido por 30 min. Exige o segundo fator se o 2FA estiver ativo. Conclui derrubando a sessão ativa.',
    })
    @ApiNoContentResponse()
    @ApiBadRequestResponse({ description: 'Senha curta demais ou token ausente' })
    @ApiUnauthorizedResponse({ description: 'Token expirado/usado ou código inválido' })
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
        await this.passwordResetService.resetPassword(
            dto.token,
            dto.newPassword,
            dto.code,
        );
    }
}
