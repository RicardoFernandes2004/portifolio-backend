import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Backend',
        description: 'Nome da categoria do post',
    })
    name!: string;
}

export class UpdateCategoryDto {
    @ApiProperty({
        example: 'DevOps',
        description: 'Novo nome da categoria',
        required: false,
    })
    name?: string;
}

export class CategoryResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Backend' })
    name!: string;

    @ApiProperty({ example: '2026-04-26T19:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T19:00:00.000Z' })
    updatedAt!: Date;
}
