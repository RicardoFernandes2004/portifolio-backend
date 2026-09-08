import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { UserRepository } from '../users/infra/repositories/user.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { TwoFactorService } from './services/two-factor.service';

@Module({
  imports: [UsersModule, MailModule],
  controllers: [AuthController],
  providers: [
    PrismaService,
    UserRepository,
    AuthService,
    TwoFactorService,
    PasswordResetService,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, UsersModule],
})
export class AuthModule {}
