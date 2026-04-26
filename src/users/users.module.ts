import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from './infra/repositories/user.repository';
import { UsersService } from './service/users/users.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as unknown as number,
        },
      }),
    }),
  ],
  providers: [PrismaService, UserRepository, UsersService],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
