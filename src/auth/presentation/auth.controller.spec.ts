import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from 'src/auth/services/auth.service';
import { PasswordResetService } from 'src/auth/services/password-reset.service';
import { TwoFactorService } from 'src/auth/services/two-factor.service';
import { UsersService } from 'src/users/service/users/users.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: TwoFactorService, useValue: {} },
        { provide: PasswordResetService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
