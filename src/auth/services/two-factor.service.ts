import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { generateSecret, generateURI, verify as verifyOtp } from 'otplib';
import type { User } from 'src/users/domain/entity/user';
import { UserRepository } from 'src/users/infra/repositories/user.repository';
import { safeEqualHex, sha256 } from 'src/common/hash';

const ISSUER = 'RC.dev';
const BACKUP_CODE_COUNT = 10;
/** 48 bits por código: são de uso único e o endpoint é rate-limitado. */
const BACKUP_CODE_BYTES = 6;
/** ±30s absorve relógio do celular fora de sincronia sem alargar demais. */
const EPOCH_TOLERANCE = 30;
const TOTP_FORMAT = /^\d{6}$/;

@Injectable()
export class TwoFactorService {
    constructor(private readonly userRepository: UserRepository) {}

    /**
     * Gera e grava um segredo, mas NÃO liga o 2FA: só o `enable`, depois de o
     * usuário provar que conseguiu ler o código, muda o comportamento do login.
     * Sem isso um enrolamento abandonado no meio tranca a conta.
     */
    async startEnrollment(
        user: User,
    ): Promise<{ secret: string; otpauthUri: string }> {
        if (user.hasTwoFactor) {
            throw new BadRequestException('2FA já está ativo');
        }
        const secret = generateSecret();
        await this.userRepository.updateSecurity(user.id, {
            twoFactorSecret: secret,
        });
        // ponytail: entrada manual do segredo; se incomodar, gerar QR com a lib qrcode
        return {
            secret,
            otpauthUri: generateURI({
                issuer: ISSUER,
                label: user.email,
                secret,
            }),
        };
    }

    async enable(user: User, code: string): Promise<{ backupCodes: string[] }> {
        if (user.hasTwoFactor) {
            throw new BadRequestException('2FA já está ativo');
        }
        if (!user.twoFactorSecret) {
            throw new BadRequestException(
                'Nenhum enrolamento em andamento; chame /auth/2fa/setup antes',
            );
        }
        if (!(await this.isValidTotp(user.twoFactorSecret, code))) {
            throw new UnauthorizedException('Código inválido');
        }

        const { plain, hashed } = this.generateBackupCodes();
        await this.userRepository.updateSecurity(user.id, {
            twoFactorEnabledAt: new Date(),
            twoFactorBackupCodes: hashed,
        });
        // Única vez que os códigos existem em texto puro.
        return { backupCodes: plain };
    }

    /** Desligar exige os dois fatores: senha roubada sozinha não derruba o 2FA. */
    async disable(user: User, password: string, code: string): Promise<void> {
        if (!user.hasTwoFactor) {
            throw new BadRequestException('2FA não está ativo');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        if (!(await this.consumeSecondFactor(user, code))) {
            throw new UnauthorizedException('Código inválido');
        }
        await this.userRepository.updateSecurity(user.id, {
            twoFactorSecret: null,
            twoFactorEnabledAt: null,
            twoFactorBackupCodes: [],
        });
    }

    async regenerateBackupCodes(
        user: User,
        code: string,
    ): Promise<{ backupCodes: string[] }> {
        if (!user.hasTwoFactor) {
            throw new BadRequestException('2FA não está ativo');
        }
        if (!(await this.consumeSecondFactor(user, code))) {
            throw new UnauthorizedException('Código inválido');
        }
        const { plain, hashed } = this.generateBackupCodes();
        await this.userRepository.updateSecurity(user.id, {
            twoFactorBackupCodes: hashed,
        });
        return { backupCodes: plain };
    }

    /**
     * Valida o segundo fator para login e para conclusão de reset.
     * Aceita TOTP de 6 dígitos ou código de backup — e o código de backup é
     * removido do banco no mesmo passo, então nunca serve duas vezes.
     */
    async consumeSecondFactor(user: User, code: string): Promise<boolean> {
        const input = (code ?? '').trim();
        if (!input) return false;

        if (TOTP_FORMAT.test(input)) {
            return this.isValidTotp(user.twoFactorSecret, input);
        }
        return this.consumeBackupCode(user, input);
    }

    private async isValidTotp(
        secret: string | null,
        code: string,
    ): Promise<boolean> {
        if (!secret || !TOTP_FORMAT.test(code.trim())) return false;
        const result = await verifyOtp({
            secret,
            token: code.trim(),
            epochTolerance: EPOCH_TOLERANCE,
        });
        return result.valid;
    }

    private async consumeBackupCode(
        user: User,
        code: string,
    ): Promise<boolean> {
        const hash = sha256(normalizeBackupCode(code));
        const remaining = user.twoFactorBackupCodes;
        const index = remaining.findIndex((stored) =>
            safeEqualHex(stored, hash),
        );
        if (index === -1) return false;

        await this.userRepository.updateSecurity(user.id, {
            twoFactorBackupCodes: remaining.filter((_, i) => i !== index),
        });
        return true;
    }

    private generateBackupCodes(): { plain: string[]; hashed: string[] } {
        const plain = Array.from({ length: BACKUP_CODE_COUNT }, () =>
            formatBackupCode(randomBytes(BACKUP_CODE_BYTES).toString('hex')),
        );
        return {
            plain,
            hashed: plain.map((c) => sha256(normalizeBackupCode(c))),
        };
    }
}

/** Hífens e caixa são cosméticos: o hash é sempre do código normalizado. */
export function normalizeBackupCode(code: string): string {
    return code.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function formatBackupCode(hex: string): string {
    return (hex.match(/.{1,4}/g) ?? [hex]).join('-');
}
