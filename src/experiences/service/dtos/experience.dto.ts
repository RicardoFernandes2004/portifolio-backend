import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperienceDto {
    @ApiProperty({ example: 'Acme Corp' })
    company!: string;

    @ApiProperty({ example: 'Senior Backend Engineer' })
    position!: string;

    @ApiProperty({
        example:
            'Liderei a migração da plataforma para NestJS e Prisma, dobrando a vazão de pedidos.',
    })
    description!: string;

    @ApiProperty({
        example: '2023-01-15T00:00:00.000Z',
        description: 'ISO date',
    })
    startDate!: string | Date;

    @ApiPropertyOptional({
        example: '2025-06-30T00:00:00.000Z',
        description: 'ISO date; null/omitido = ainda atual',
        nullable: true,
    })
    endDate?: string | Date | null;
}

export class UpdateExperienceDto {
    @ApiPropertyOptional({ example: 'Acme Corp' })
    company?: string;

    @ApiPropertyOptional({ example: 'Tech Lead' })
    position?: string;

    @ApiPropertyOptional({ example: 'Descrição atualizada...' })
    description?: string;

    @ApiPropertyOptional({ example: '2023-01-15T00:00:00.000Z' })
    startDate?: string | Date;

    @ApiPropertyOptional({
        example: '2025-06-30T00:00:00.000Z',
        nullable: true,
    })
    endDate?: string | Date | null;
}

export class ExperienceResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Acme Corp' })
    company!: string;

    @ApiProperty({ example: 'Senior Backend Engineer' })
    position!: string;

    @ApiProperty({ example: 'Liderei a migração para NestJS e Prisma...' })
    description!: string;

    @ApiProperty({ example: '2023-01-15T00:00:00.000Z' })
    startDate!: Date;

    @ApiProperty({ example: '2025-06-30T00:00:00.000Z', nullable: true })
    endDate!: Date | null;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
