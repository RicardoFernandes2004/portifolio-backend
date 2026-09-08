import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResumeHeaderDto {
    @ApiPropertyOptional({ example: 'Ricardo Silva' })
    name?: string;

    @ApiPropertyOptional({ example: 'Senior Backend Engineer' })
    jobTitle?: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `jobTitle`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    jobTitleEn?: string | null;

    @ApiPropertyOptional({
        example:
            'Engenheiro de software com foco em backend, distributed systems e DX.',
    })
    summary?: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `summary`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    summaryEn?: string | null;

    @ApiPropertyOptional({ example: 'Porto Alegre, RS, Brasil' })
    location?: string;

    @ApiPropertyOptional({ example: 'ricardo@portifolio.dev' })
    email?: string;

    @ApiPropertyOptional({ example: '+55 51 99999-0000' })
    phone?: string;

    @ApiPropertyOptional({ example: 'https://meu-portfolio.dev' })
    website?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/ricardo' })
    linkedin?: string;

    @ApiPropertyOptional({ example: 'https://github.com/ricardo' })
    github?: string;
}

export class ResumeHeaderResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Ricardo Silva' })
    name!: string;

    @ApiProperty({ example: 'Senior Backend Engineer' })
    jobTitle!: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `jobTitle`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    jobTitleEn!: string | null;

    @ApiProperty({
        example:
            'Engenheiro de software com foco em backend, distributed systems e DX.',
    })
    summary!: string;

    @ApiPropertyOptional({
        description: 'Traducao EN de `summary`. null/ausente = front cai no portugues.',
        nullable: true,
    })
    summaryEn!: string | null;

    @ApiProperty({ example: 'Porto Alegre, RS, Brasil' })
    location!: string;

    @ApiProperty({ example: 'ricardo@portifolio.dev' })
    email!: string;

    @ApiProperty({ example: '+55 51 99999-0000' })
    phone!: string;

    @ApiProperty({ example: 'https://meu-portfolio.dev' })
    website!: string;

    @ApiProperty({ example: 'https://linkedin.com/in/ricardo' })
    linkedin!: string;

    @ApiProperty({ example: 'https://github.com/ricardo' })
    github!: string;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
