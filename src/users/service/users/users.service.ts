import { Injectable } from '@nestjs/common';
import { User } from 'src/users/domain/entity/user';

@Injectable()
export class UsersService {



    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        
    }
}
