import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ example: 'Portfolio Backend' })
    title!: string;

    @ApiProperty({
        example: 'API NestJS + Prisma com blog, currículo dinâmico e auth.',
    })
    description!: string;

    @ApiPropertyOptional({
        example: ['https://cdn.exemplo.com/projects/portfolio/cover.png'],
        type: [String],
    })
    images?: string[];

    @ApiPropertyOptional({
        example: ['NestJS', 'Prisma', 'PostgreSQL'],
        type: [String],
    })
    technologies?: string[];

    @ApiPropertyOptional({ example: 'https://meu-portfolio.dev', nullable: true })
    link?: string | null;

    @ApiPropertyOptional({
        example: 'https://github.com/ricardo/portfolio-backend',
        nullable: true,
    })
    githubLink?: string | null;

    @ApiPropertyOptional({
        example: 'https://youtube.com/@ricardo',
        nullable: true,
    })
    youtubeLink?: string | null;

    @ApiPropertyOptional({
        example: 'https://instagram.com/ricardo.dev',
        nullable: true,
    })
    instagramLink?: string | null;

    @ApiPropertyOptional({
        example: 'https://twitter.com/ricardo_dev',
        nullable: true,
    })
    twitterLink?: string | null;

    @ApiPropertyOptional({
        example: 'https://facebook.com/ricardo.dev',
        nullable: true,
    })
    facebookLink?: string | null;

    @ApiPropertyOptional({
        example: ['Joana Silva', 'Pedro Santos'],
        type: [String],
    })
    collaborators?: string[];
}

export class UpdateProjectDto {
    @ApiPropertyOptional({ example: 'Portfolio Backend v2' })
    title?: string;

    @ApiPropertyOptional({ example: 'Nova descrição' })
    description?: string;

    @ApiPropertyOptional({ type: [String] })
    images?: string[];

    @ApiPropertyOptional({ type: [String] })
    technologies?: string[];

    @ApiPropertyOptional({ nullable: true })
    link?: string | null;

    @ApiPropertyOptional({ nullable: true })
    githubLink?: string | null;

    @ApiPropertyOptional({ nullable: true })
    youtubeLink?: string | null;

    @ApiPropertyOptional({ nullable: true })
    instagramLink?: string | null;

    @ApiPropertyOptional({ nullable: true })
    twitterLink?: string | null;

    @ApiPropertyOptional({ nullable: true })
    facebookLink?: string | null;

    @ApiPropertyOptional({ type: [String] })
    collaborators?: string[];
}

export class ProjectResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Portfolio Backend' })
    title!: string;

    @ApiProperty({
        example: 'API NestJS + Prisma com blog, currículo dinâmico e auth.',
    })
    description!: string;

    @ApiProperty({
        example: ['https://cdn.exemplo.com/projects/portfolio/cover.png'],
        type: [String],
    })
    images!: string[];

    @ApiProperty({ example: ['NestJS', 'Prisma'], type: [String] })
    technologies!: string[];

    @ApiProperty({ example: 'https://meu-portfolio.dev', nullable: true })
    link!: string | null;

    @ApiProperty({
        example: 'https://github.com/ricardo/portfolio-backend',
        nullable: true,
    })
    githubLink!: string | null;

    @ApiProperty({ example: null, nullable: true })
    youtubeLink!: string | null;

    @ApiProperty({ example: null, nullable: true })
    instagramLink!: string | null;

    @ApiProperty({ example: null, nullable: true })
    twitterLink!: string | null;

    @ApiProperty({ example: null, nullable: true })
    facebookLink!: string | null;

    @ApiProperty({ example: ['Joana Silva'], type: [String] })
    collaborators!: string[];

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T18:00:00.000Z' })
    updatedAt!: Date;
}
