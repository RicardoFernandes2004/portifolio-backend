import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({
        example: 'João Silva',
        description: 'Nome de exibição do autor do comentário',
    })
    authorName!: string;

    @ApiProperty({
        example: 'Muito bom o post, me ajudou bastante!',
        description: 'Conteúdo do comentário',
    })
    content!: string;

    @ApiPropertyOptional({
        example: 'joao@exemplo.com',
        description: 'Email opcional do autor (não exibido publicamente)',
        nullable: true,
    })
    authorEmail?: string | null;

    @ApiPropertyOptional({
        example: 5,
        description: 'ID do comentário pai, para respostas aninhadas',
        nullable: true,
    })
    parentId?: number | null;
}

export class CommentResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 1 })
    postId!: number;

    @ApiProperty({ example: null, nullable: true })
    parentId!: number | null;

    @ApiProperty({ example: 'João Silva' })
    authorName!: string;

    @ApiProperty({ example: 'Muito bom o post!' })
    content!: string;

    @ApiProperty({
        example: 'PUBLISHED',
        enum: ['PUBLISHED', 'PENDING'],
        description:
            'PENDING = retido para moderação (bateu na blacklist), não aparece publicamente até aprovação',
    })
    status!: string;

    @ApiProperty({
        type: () => [CommentResponseDto],
        description: 'Respostas aninhadas (apenas publicadas no fluxo público)',
    })
    replies!: CommentResponseDto[];

    @ApiProperty({ example: '2026-04-26T18:30:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-04-26T19:15:00.000Z' })
    updatedAt!: Date;
}
