import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard, UsersModule],
})
export class AuthModule {}
