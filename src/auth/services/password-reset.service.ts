import {
    BadRequestException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/domain/entity/user';
import { UserRepository } from 'src/users/infra/repositories/user.repository';
import { randomToken, sha256 } from 'src/common/hash';
import { TwoFactorService } from './two-factor.service';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 30 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class PasswordResetService {
    private readonly logger = new Logger(PasswordResetService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly twoFactorService: TwoFactorService,
        private readonly mailService: MailService,
    ) {}

    /**
     * Sempre retorna sem erro, exista o email ou não: qualquer diferença de
     * resposta transforma este endpoint em oráculo de enumeração de conta.
     */
    async requestReset(email: string): Promise<void> {
        const normalized = (email ?? '').trim().toLowerCase();
        if (!normalized) return;

        const row = await this.userRepository.findByEmail(normalized);
        if (!row) return;

        const token = randomToken(TOKEN_BYTES);
        await this.userRepository.updateSecurity(row.id, {
            // Só o hash é persistido: vazamento do banco não dá reset a ninguém.
            passwordResetTokenHash: sha256(token),
            passwordResetExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        });

        const appUrl = (process.env.APP_URL ?? '').replace(/\/+$/, '');
        const link = `${appUrl}/reset-password/${token}`;

        try {
            await this.mailService.sendPasswordReset(row.email, link);
        } catch (err) {
            // Engolido de propósito: o chamador não pode distinguir os casos.
            this.logger.error(
                `Falha ao enviar email de reset: ${err instanceof Error ? err.message : String(err)}`,
            );
        }
    }

    /**
     * Conclui o reset. Com 2FA ativo o código é obrigatório — é isso que impede
     * que uma caixa de email comprometida, sozinha, tome o painel.
     */
    async resetPassword(
        token: string,
        newPassword: string,
        code?: string,
    ): Promise<void> {
        if (!token?.trim()) {
            throw new BadRequestException('token é obrigatório');
        }
        if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
            throw new BadRequestException(
                `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
            );
        }

        const row = await this.userRepository.findByPasswordResetTokenHash(
            sha256(token.trim()),
        );
        if (!row) {
            throw new UnauthorizedException('Token inválido ou já utilizado');
        }

        const user = User.fromPrisma(row);
        if (
            !user.passwordResetExpiresAt ||
            user.passwordResetExpiresAt.getTime() <= Date.now()
        ) {
            throw new UnauthorizedException('Token expirado');
        }

        if (user.hasTwoFactor) {
            if (!(await this.twoFactorService.consumeSecondFactor(user, code ?? ''))) {
                throw new UnauthorizedException('Código de verificação inválido');
            }
        }

        await this.userRepository.updateSecurity(user.id, {
            password: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
            passwordResetTokenHash: null,
            passwordResetExpiresAt: null,
            // Derruba a sessão ativa: se alguém já estava logado com a senha
            // antiga, o reset expulsa. O guard compara o token contra a coluna,
            // então um valor impossível de assinar basta para revogar.
            jwtToken: `revoked-${randomUUID()}`,
            jwtTokenExpiresAt: new Date(0),
        });
    }
}
