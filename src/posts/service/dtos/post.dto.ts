import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from 'src/categories/service/dtos/category.dto';

export class CreatePostDto {
    @ApiProperty({
        example: 'Como configurei JWT stateful no NestJS',
        description: 'Título do post (também usado para auto-gerar o slug)',
    })
    title!: string;

    @ApiProperty({
        example: 'Resumo curto que aparece em listagens.',
        description: 'Resumo / chamada do post',
    })
    summary!: string;

    @ApiProperty({
        example: '# Introdução\n\nNeste post vou explicar como...',
        description: 'Conteúdo completo (markdown ou HTML conforme o renderer do front)',
    })
    content!: string;

    @ApiProperty({
        example: 1,
        description: 'ID de uma categoria existente',
    })
    categoryId!: number;

    @ApiPropertyOptional({
        example: 'jwt-stateful-nestjs',
        description: 'Slug customizado; se omitido é derivado do title',
    })
    slug?: string;

    @ApiPropertyOptional({
        example: ['https://cdn.exemplo.com/post-1/cover.png'],
        type: [String],
        description: 'URLs das imagens do post',
    })
    images?: string[];

    @ApiPropertyOptional({
        example: '2026-04-26T19:00:00.000Z',
        description:
            'ISO date para agendar/publicar; null ou omitido = draft (não aparece na listagem pública)',
        nullable: true,
    })
    publishedAt?: string | Date | null;
}

export class UpdatePostDto {
    @ApiPropertyOptional({ example: 'Novo título do post' })
    title?: string;

    @ApiPropertyOptional({ example: 'Novo resumo' })
    summary?: string;

    @ApiPropertyOptional({ example: '# Conteúdo atualizado' })
    content?: string;

    @ApiPropertyOptional({ example: 2 })
    categoryId?: number;

    @ApiPropertyOptional({ example: 'novo-slug-customizado' })
    slug?: string;

    @ApiPropertyOptional({
        example: ['https://cdn.exemplo.com/post-1/cover-v2.png'],
        type: [String],
    })
    images?: string[];

    @ApiPropertyOptional({
        example: '2026-04-26T19:00:00.000Z',
        nullable: true,
    })
    publishedAt?: string | Date | null;
}

export class PostResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'jwt-stateful-nestjs' })
    slug!: string;

    @ApiProperty({ example: 'Como configurei JWT stateful no NestJS' })
    title!: string;

    @ApiProperty({ example: 'Resumo curto que aparece em listagens.' })
    summary!: string;

    @ApiProperty({ example: '# Introdução\n\nNeste post...' })
    content!: string;

    @ApiProperty({
        example: ['https://cdn.exemplo.com/post-1/cover.png'],
        type: [String],
    })
    images!: string[];

    @ApiProperty({ example: 1 })
    categoryId!: number;

    @ApiProperty({
        type: () => CategoryResponseDto,
        nullable: true,
        description: 'Categoria nested (null se a relação não foi carregada)',
    })
    category!: CategoryResponseDto | null;

    @ApiProperty({
        example: '2026-04-26T19:00:00.000Z',
        nullable: true,
        description: 'null = draft',
    })
    publishedAt!: Date | null;

    @ApiProperty({
        example: true,
        description: 'true se publishedAt já passou',
    })
    isPublished!: boolean;

    @ApiProperty({ example: '2026-04-26T18:30:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T19:15:00.000Z' })
    updatedAt!: Date;
}
