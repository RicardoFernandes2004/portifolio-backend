import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEducationDto {
    @ApiProperty({ example: 'Universidade Federal do Rio Grande do Sul' })
    school!: string;

    @ApiProperty({ example: 'Bacharelado' })
    degree!: string;

    @ApiProperty({ example: 'Ciência da Computação' })
    fieldOfStudy!: string;

    @ApiProperty({ example: '2018-03-01T00:00:00.000Z' })
    startDate!: string | Date;

    @ApiPropertyOptional({
        example: '2022-12-15T00:00:00.000Z',
        nullable: true,
    })
    endDate?: string | Date | null;
}

export class UpdateEducationDto {
    @ApiPropertyOptional({ example: 'UFRGS' })
    school?: string;

    @ApiPropertyOptional({ example: 'Mestrado' })
    degree?: string;

    @ApiPropertyOptional({ example: 'Engenharia de Software' })
    fieldOfStudy?: string;

    @ApiPropertyOptional({ example: '2018-03-01T00:00:00.000Z' })
    startDate?: string | Date;

    @ApiPropertyOptional({
        example: '2022-12-15T00:00:00.000Z',
        nullable: true,
    })
    endDate?: string | Date | null;
}

export class EducationResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'UFRGS' })
    school!: string;

    @ApiProperty({ example: 'Bacharelado' })
    degree!: string;

    @ApiProperty({ example: 'Ciência da Computação' })
    fieldOfStudy!: string;

    @ApiProperty({ example: '2018-03-01T00:00:00.000Z' })
    startDate!: Date;

    @ApiProperty({ example: '2022-12-15T00:00:00.000Z', nullable: true })
    endDate!: Date | null;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
