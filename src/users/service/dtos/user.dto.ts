import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'admin' })
    username!: string;

    @ApiProperty({ example: 'admin@portifolio.dev' })
    email!: string;

    @ApiProperty({ example: 'Tr0ub4dor&3' })
    password!: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'admin' })
    username?: string;

    @ApiPropertyOptional({ example: 'admin@portifolio.dev' })
    email?: string;

    @ApiPropertyOptional({ example: 'Tr0ub4dor&3' })
    password?: string;
}

export class LoginUserDto {
    @ApiPropertyOptional({
        example: 'admin@portifolio.dev',
        description: 'Email do usuário (envie email OU username)',
    })
    email?: string;

    @ApiPropertyOptional({
        example: 'admin',
        description: 'Username do usuário (envie email OU username)',
    })
    username?: string;

    @ApiProperty({ example: 'Tr0ub4dor&3' })
    password!: string;
}

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'admin' })
    username!: string;

    @ApiProperty({ example: 'admin@portifolio.dev' })
    email!: string;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}

export class LoginUserResponseDto {
    @ApiProperty({ type: () => UserResponseDto })
    user!: UserResponseDto;

    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTcxOTQyNzYwMH0.dEMo',
        description: 'Bearer JWT a ser enviado em Authorization: Bearer <token>',
    })
    token!: string;

    @ApiProperty({
        example: '2026-04-27T18:00:00.000Z',
        description: 'Quando o token expira (deve fazer login novamente após)',
    })
    tokenExpiresAt!: Date;
}
