import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLanguageDto {
    @ApiProperty({ example: 'Inglês' })
    name!: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `name`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    nameEn?: string | null;

    @ApiProperty({
        example: 4,
        description: 'Proficiência (escala 1-5; 5 = nativo/fluente)',
    })
    level!: number;
}

export class UpdateLanguageDto {
    @ApiPropertyOptional({ example: 'Espanhol' })
    name?: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `name`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    nameEn?: string | null;

    @ApiPropertyOptional({ example: 3 })
    level?: number;
}

export class LanguageResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Inglês' })
    name!: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `name`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    nameEn!: string | null;

    @ApiProperty({ example: 4 })
    level!: number;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
