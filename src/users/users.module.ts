import { Module } from '@nestjs/common';
import { UsersService } from './service/users/users.service';

@Module({
  providers: [UsersService]
})
export class UsersModule {}
