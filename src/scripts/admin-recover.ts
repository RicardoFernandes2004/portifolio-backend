/**
 * Recuperação de emergência do admin. Vive em src/ de propósito: o `nest build`
 * compila para dist/, que é o que a imagem de produção carrega — roda com
 * `node`, sem tsx e sem devDependencies.
 *
 *   fly ssh console -C "node dist/src/scripts/admin-recover.js --set-password 'nova-senha-longa'"
 *   fly ssh console -C "node dist/src/scripts/admin-recover.js --disable-2fa"
 *
 * Não cria privilégio novo: quem tem `fly ssh` já tem a DATABASE_URL e acesso
 * total ao banco. Isto só evita escrever SQL à mão no pior dia possível.
 */
import '../env';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_ROUNDS = 10;

function usage(): never {
    console.error(
        [
            'uso:',
            '  admin-recover --set-password <senha>   troca a senha e derruba a sessão ativa',
            '  admin-recover --disable-2fa           desliga o 2FA e limpa os códigos de backup',
            '  admin-recover --status                mostra o estado da conta',
            '',
            'opcional: --email <email>  (default: o único usuário da tabela)',
        ].join('\n'),
    );
    process.exit(1);
}

function argValue(args: string[], flag: string): string | undefined {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const setPassword = argValue(args, '--set-password');
    const disable2fa = args.includes('--disable-2fa');
    const status = args.includes('--status');
    if (!setPassword && !disable2fa && !status) usage();

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });

    try {
        const email = argValue(args, '--email');
        const user = email
            ? await prisma.user.findUnique({ where: { email } })
            : await prisma.user.findFirst({ orderBy: { id: 'asc' } });
        if (!user) throw new Error('Nenhum usuário encontrado');

        if (status) {
            console.log(
                JSON.stringify(
                    {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        twoFactorEnabled: user.twoFactorEnabledAt !== null,
                        backupCodesRemaining: user.twoFactorBackupCodes.length,
                        sessionExpiresAt: user.jwtTokenExpiresAt,
                    },
                    null,
                    2,
                ),
            );
            return;
        }

        if (setPassword !== undefined) {
            if (setPassword.length < MIN_PASSWORD_LENGTH) {
                throw new Error(
                    `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
                );
            }
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: await bcrypt.hash(setPassword, BCRYPT_ROUNDS),
                    passwordResetTokenHash: null,
                    passwordResetExpiresAt: null,
                    // Mesma revogação do fluxo normal de reset.
                    jwtToken: `revoked-${randomUUID()}`,
                    jwtTokenExpiresAt: new Date(0),
                },
            });
            console.log(`senha trocada para ${user.email}; sessão ativa revogada`);
        }

        if (disable2fa) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    twoFactorSecret: null,
                    twoFactorEnabledAt: null,
                    twoFactorBackupCodes: [],
                },
            });
            console.log(`2FA desligado para ${user.email}`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
