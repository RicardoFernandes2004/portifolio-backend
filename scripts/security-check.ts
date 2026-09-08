/**
 * Checagem das invariantes de segurança do 2FA e do reset de senha.
 *
 *   npm run check:security
 *
 * Roda com repositório em memória: sem banco, sem rede, sem Nest. Existe fora
 * do jest de propósito — as 3 specs do projeto não rodam desde antes deste
 * trabalho (o jest não resolve os imports `src/...` nem os especificadores
 * `.js` do client gerado do Prisma), e consertar aquilo é tarefa própria.
 */
import { strict as assert } from 'node:assert';
import { generate as generateTotp, generateSecret } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User as PrismaUser } from '../src/generated/prisma/client';
import { User } from '../src/users/domain/entity/user';
import type { UpdateUserSecurityData } from '../src/users/service/dtos/user.ports';
import { UserRepository } from '../src/users/infra/repositories/user.repository';
import { TwoFactorService } from '../src/auth/services/two-factor.service';
import { PasswordResetService } from '../src/auth/services/password-reset.service';
import { AuthService } from '../src/auth/services/auth.service';
import { MailService } from '../src/mail/mail.service';
import { UsersService } from '../src/users/service/users/users.service';
import { sha256 } from '../src/common/hash';
import { normalizeBackupCode } from '../src/auth/services/two-factor.service';

const JWT_SECRET = 'check-secret';
process.env.JWT_SECRET = JWT_SECRET;

function makeRow(overrides: Partial<PrismaUser> = {}): PrismaUser {
    return {
        id: 1,
        username: 'admin',
        email: 'admin@exemplo.dev',
        password: bcrypt.hashSync('senha-bem-comprida', 4),
        jwtToken: 'sessao-atual',
        jwtTokenExpiresAt: new Date(Date.now() + 3_600_000),
        jwtTokenCreatedAt: new Date(),
        jwtTokenUpdatedAt: new Date(),
        twoFactorSecret: null,
        twoFactorEnabledAt: null,
        twoFactorBackupCodes: [],
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as PrismaUser;
}

/** Repositório em memória com a superfície que os serviços usam. */
function fakeRepo(row: PrismaUser) {
    const state = { row };
    return {
        state,
        repo: {
            findById: async (id: number) => (id === state.row.id ? state.row : null),
            findByEmail: async (email: string) =>
                email === state.row.email ? state.row : null,
            findByEmailOrUsername: async () => state.row,
            findByPasswordResetTokenHash: async (hash: string) =>
                state.row.passwordResetTokenHash === hash ? state.row : null,
            updateSecurity: async (_id: number, data: UpdateUserSecurityData) => {
                state.row = { ...state.row, ...data } as PrismaUser;
                return state.row;
            },
            updateToken: async (_id: number, jwtToken: string, exp: Date) => {
                state.row = {
                    ...state.row,
                    jwtToken,
                    jwtTokenExpiresAt: exp,
                } as PrismaUser;
                return state.row;
            },
        } as unknown as UserRepository,
    };
}

const silentMail = {
    sendPasswordReset: async () => undefined,
} as unknown as MailService;

async function backupCodeIsSingleUse(): Promise<void> {
    const code = 'abcd-ef01-2345';
    const { state, repo } = fakeRepo(
        makeRow({
            twoFactorEnabledAt: new Date(),
            twoFactorSecret: generateSecret(),
            twoFactorBackupCodes: [sha256(normalizeBackupCode(code))],
        }),
    );
    const service = new TwoFactorService(repo);

    assert.equal(
        await service.consumeSecondFactor(User.fromPrisma(state.row), code),
        true,
        'código de backup válido é aceito',
    );
    assert.deepEqual(
        state.row.twoFactorBackupCodes,
        [],
        'código consumido sai do banco no mesmo passo',
    );
    assert.equal(
        await service.consumeSecondFactor(User.fromPrisma(state.row), code),
        false,
        'o MESMO código de backup não funciona duas vezes',
    );
    // Formatação é cosmética: o hash é do código normalizado.
    assert.equal(
        normalizeBackupCode('ABCD-EF01-2345'),
        normalizeBackupCode('abcdef012345'),
        'hífen e caixa não mudam o código',
    );
}

async function totpAcceptsOnlyValidCodes(): Promise<void> {
    const secret = generateSecret();
    const { state, repo } = fakeRepo(
        makeRow({ twoFactorEnabledAt: new Date(), twoFactorSecret: secret }),
    );
    const service = new TwoFactorService(repo);
    const user = User.fromPrisma(state.row);

    const valid = await generateTotp({ secret });
    assert.equal(await service.consumeSecondFactor(user, valid), true, 'TOTP válido entra');
    assert.equal(
        await service.consumeSecondFactor(user, '000000'),
        false,
        'TOTP errado é rejeitado',
    );
    assert.equal(await service.consumeSecondFactor(user, ''), false, 'código vazio é rejeitado');
}

async function resetTokenRules(): Promise<void> {
    const token = 'token-de-reset';
    const build = (expiresAt: Date) =>
        fakeRepo(
            makeRow({
                passwordResetTokenHash: sha256(token),
                passwordResetExpiresAt: expiresAt,
            }),
        );

    // expirado
    const expired = build(new Date(Date.now() - 1000));
    const svcExpired = new PasswordResetService(
        expired.repo,
        new TwoFactorService(expired.repo),
        silentMail,
    );
    await assert.rejects(
        () => svcExpired.resetPassword(token, 'senha-nova-bem-longa'),
        /expirado/i,
        'token expirado é rejeitado',
    );

    // válido
    const ok = build(new Date(Date.now() + 60_000));
    const svc = new PasswordResetService(
        ok.repo,
        new TwoFactorService(ok.repo),
        silentMail,
    );
    const sessionBefore = ok.state.row.jwtToken;
    await svc.resetPassword(token, 'senha-nova-bem-longa');

    assert.equal(
        await bcrypt.compare('senha-nova-bem-longa', ok.state.row.password),
        true,
        'senha nova foi gravada com hash',
    );
    assert.equal(ok.state.row.passwordResetTokenHash, null, 'token é de uso único');
    assert.notEqual(
        ok.state.row.jwtToken,
        sessionBefore,
        'reset derruba a sessão que estava ativa',
    );

    // senha curta
    const short = build(new Date(Date.now() + 60_000));
    const svcShort = new PasswordResetService(
        short.repo,
        new TwoFactorService(short.repo),
        silentMail,
    );
    await assert.rejects(
        () => svcShort.resetPassword(token, 'curta'),
        /12 caracteres/,
        'senha abaixo do mínimo é rejeitada',
    );
}

async function resetRequiresSecondFactorWhenEnabled(): Promise<void> {
    const token = 'token-com-2fa';
    const secret = generateSecret();
    const { state, repo } = fakeRepo(
        makeRow({
            twoFactorEnabledAt: new Date(),
            twoFactorSecret: secret,
            passwordResetTokenHash: sha256(token),
            passwordResetExpiresAt: new Date(Date.now() + 60_000),
        }),
    );
    const svc = new PasswordResetService(repo, new TwoFactorService(repo), silentMail);

    await assert.rejects(
        () => svc.resetPassword(token, 'senha-nova-bem-longa'),
        /verificação inválido/i,
        'com 2FA ativo, link de email sozinho NÃO reseta a senha',
    );

    await svc.resetPassword(
        token,
        'senha-nova-bem-longa',
        await generateTotp({ secret }),
    );
    assert.equal(
        await bcrypt.compare('senha-nova-bem-longa', state.row.password),
        true,
        'com o código correto o reset conclui',
    );
}

async function challengeTokenIsNotASession(): Promise<void> {
    const secret = generateSecret();
    const { state, repo } = fakeRepo(
        makeRow({ twoFactorEnabledAt: new Date(), twoFactorSecret: secret }),
    );
    const jwt = new JwtService({ secret: JWT_SECRET, signOptions: { expiresIn: '5m' } });
    const usersService = new UsersService(repo, jwt);
    const auth = new AuthService(usersService, new TwoFactorService(repo), jwt);

    const login = await auth.login({
        email: state.row.email,
        password: 'senha-bem-comprida',
    });
    assert.ok(
        'twoFactorRequired' in login,
        'com 2FA ativo o login para no primeiro fator',
    );
    assert.ok(
        !('token' in login),
        'nenhuma sessão é emitida antes do segundo fator',
    );

    const { challengeToken } = login as { challengeToken: string };
    assert.notEqual(
        state.row.jwtToken,
        challengeToken,
        'challenge nunca é gravado como sessão do usuário',
    );

    // Um JWT válido porém sem typ='2fa' não conclui login.
    const semTyp = await jwt.signAsync({ sub: state.row.id });
    const codigoValido = await generateTotp({ secret });
    await assert.rejects(
        () => auth.completeTwoFactorLogin(semTyp, codigoValido),
        /não é um challenge/i,
        'token de sessão não vale como challenge de 2FA',
    );

    const session = await auth.completeTwoFactorLogin(
        challengeToken,
        await generateTotp({ secret }),
    );
    assert.ok(session.token, 'com challenge + código válido a sessão é emitida');
    assert.equal(state.row.jwtToken, session.token, 'sessão gravada no usuário');
}

async function main(): Promise<void> {
    const checks = [
        backupCodeIsSingleUse,
        totpAcceptsOnlyValidCodes,
        resetTokenRules,
        resetRequiresSecondFactorWhenEnabled,
        challengeTokenIsNotASession,
    ];
    for (const check of checks) {
        await check();
        console.log(`  ok  ${check.name}`);
    }
    console.log(`\n${checks.length} checagens de segurança passaram`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
