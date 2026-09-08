import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
    LoginUserDto,
    LoginUserResponseDto,
} from 'src/users/service/dtos/user.dto';
import { UsersService } from 'src/users/service/users/users.service';
import type { TwoFactorChallengeDto } from './dtos/auth.dto';
import { TwoFactorService } from './two-factor.service';

/** Tempo entre provar a senha e provar o segundo fator. */
const CHALLENGE_TTL = '5m';
/** Marca o JWT como challenge; um token de sessão nunca carrega isso. */
const CHALLENGE_TYP = '2fa';

/**
 * Hash descartável comparado quando o usuário não existe, para que o caminho
 * "não achei" custe o mesmo tempo do "senha errada". Sem isso a diferença de
 * latência enumera contas.
 */
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

interface ChallengePayload {
    sub: number;
    typ: string;
}

export type LoginResult = LoginUserResponseDto | TwoFactorChallengeDto;

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly twoFactorService: TwoFactorService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginUserDto: LoginUserDto): Promise<LoginResult> {
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
            await bcrypt.compare(loginUserDto.password, DUMMY_HASH);
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(
            loginUserDto.password,
            user.password,
        );
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Sem 2FA enrolado o fluxo é o de sempre — é o que mantém o login
        // funcionando antes e durante o enrolamento.
        if (!user.hasTwoFactor) {
            return this.issueSession(user.id);
        }

        const challengeToken = await this.jwtService.signAsync(
            { sub: user.id, typ: CHALLENGE_TYP },
            { expiresIn: CHALLENGE_TTL },
        );
        return { twoFactorRequired: true, challengeToken };
    }

    async completeTwoFactorLogin(
        challengeToken: string,
        code: string,
    ): Promise<LoginUserResponseDto> {
        if (!challengeToken || !code) {
            throw new BadRequestException('challengeToken and code are required');
        }

        let payload: ChallengePayload;
        try {
            payload = await this.jwtService.verifyAsync<ChallengePayload>(
                challengeToken,
                { secret: process.env.JWT_SECRET },
            );
        } catch {
            throw new UnauthorizedException('Challenge inválido ou expirado');
        }

        // Verificado explicitamente para não depender do efeito colateral de o
        // challenge nunca ter sido gravado em user.jwtToken.
        if (payload.typ !== CHALLENGE_TYP) {
            throw new UnauthorizedException('Token não é um challenge de 2FA');
        }

        const user = await this.usersService.findById(payload.sub);
        if (!user || !user.hasTwoFactor) {
            throw new UnauthorizedException('Challenge inválido');
        }

        if (!(await this.twoFactorService.consumeSecondFactor(user, code))) {
            throw new UnauthorizedException('Código inválido');
        }

        return this.issueSession(user.id);
    }

    /** Relê o usuário porque o consumo de código de backup pode tê-lo alterado. */
    private async issueSession(userId: number): Promise<LoginUserResponseDto> {
        const user = await this.usersService.findById(userId);
        if (!user) {
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
