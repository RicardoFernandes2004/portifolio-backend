import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TwoFactorChallengeDto {
    @ApiProperty({
        example: true,
        description:
            'Login parou no primeiro fator. Nenhuma sessão foi criada: chame /auth/login/2fa com o challengeToken.',
    })
    twoFactorRequired!: true;

    @ApiProperty({
        description:
            'JWT de vida curta (5 min) que só serve para concluir o login. Não é um token de sessão.',
    })
    challengeToken!: string;
}

export class TwoFactorLoginDto {
    @ApiProperty({ description: 'challengeToken devolvido por /auth/login' })
    challengeToken!: string;

    @ApiProperty({
        example: '123456',
        description: 'Código do app autenticador (6 dígitos) ou código de backup',
    })
    code!: string;
}

export class TwoFactorSetupResponseDto {
    @ApiProperty({
        example: 'JBSWY3DPEHPK3PXP',
        description: 'Segredo base32 para digitar manualmente no app',
    })
    secret!: string;

    @ApiProperty({
        example: 'otpauth://totp/RC.dev:admin@exemplo.com?secret=...',
        description: 'URI padrão otpauth, aceita por qualquer app autenticador',
    })
    otpauthUri!: string;
}

export class TwoFactorCodeDto {
    @ApiProperty({ example: '123456' })
    code!: string;
}

export class DisableTwoFactorDto {
    @ApiProperty({ description: 'Senha atual' })
    password!: string;

    @ApiProperty({ example: '123456', description: 'TOTP ou código de backup' })
    code!: string;
}

export class BackupCodesResponseDto {
    @ApiProperty({
        type: [String],
        example: ['a1b2-c3d4-e5f6', '1234-5678-9abc'],
        description:
            'Códigos de uso único. Só aparecem uma vez — o banco guarda apenas o hash.',
    })
    backupCodes!: string[];
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'admin@portifolio.dev' })
    email!: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Token recebido no link do email' })
    token!: string;

    @ApiProperty({ description: 'Nova senha (mínimo 12 caracteres)' })
    newPassword!: string;

    @ApiPropertyOptional({
        example: '123456',
        description: 'Obrigatório se o 2FA estiver ativo. TOTP ou código de backup.',
    })
    code?: string;
}
