import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
    @ApiProperty({ example: 'TypeScript' })
    name!: string;

    @ApiProperty({
        example: 5,
        description: 'Nível auto-avaliado (escala 1-5)',
    })
    level!: number;

    @ApiPropertyOptional({
        example: 'Tipagem estática para JS, usado nos projetos do dia a dia.',
        nullable: true,
    })
    description?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.exemplo.com/icons/typescript.svg',
        nullable: true,
    })
    icon?: string | null;
}

export class UpdateSkillDto {
    @ApiPropertyOptional({ example: 'TypeScript' })
    name?: string;

    @ApiPropertyOptional({ example: 4 })
    level?: number;

    @ApiPropertyOptional({ example: 'Descrição atualizada', nullable: true })
    description?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.exemplo.com/icons/typescript.svg',
        nullable: true,
    })
    icon?: string | null;
}

export class SkillResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'TypeScript' })
    name!: string;

    @ApiProperty({ example: 5 })
    level!: number;

    @ApiProperty({
        example: 'Tipagem estática para JS, usado nos projetos do dia a dia.',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        example: 'https://cdn.exemplo.com/icons/typescript.svg',
        nullable: true,
    })
    icon!: string | null;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
