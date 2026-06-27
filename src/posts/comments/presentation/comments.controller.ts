import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    CommentResponseDto,
    CreateCommentDto,
} from 'src/posts/comments/service/dtos/comment.dto';
import { CommentsService } from 'src/posts/comments/service/comments.service';

@ApiTags('comments')
@Controller('posts')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get('comments/pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Listar comentários pendentes de moderação (admin)',
        description:
            'Comentários retidos por baterem na blacklist. Aprove ou apague cada um.',
    })
    @ApiOkResponse({ type: [CommentResponseDto] })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async listPending(): Promise<CommentResponseDto[]> {
        const items = await this.commentsService.findPending();
        return items.map((c) => c.toResponseDto());
    }

    @Post('comments/:id/approve')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Aprovar comentário pendente (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: CommentResponseDto })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Comentário não encontrado' })
    async approve(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<CommentResponseDto> {
        const comment = await this.commentsService.approve(id);
        return comment.toResponseDto();
    }

    @Delete('comments/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Apagar comentário (admin)',
        description: 'Remove o comentário e suas respostas (cascade).',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Comentário removido' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Comentário não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.commentsService.delete(id);
    }

    @Post(':postId/comments')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiOperation({
        summary: 'Criar comentário em um post (público)',
        description:
            'Publicado na hora; se o conteúdo bater na blacklist, fica PENDING aguardando moderação.',
    })
    @ApiParam({ name: 'postId', type: Number, example: 1 })
    @ApiBody({ type: CreateCommentDto })
    @ApiCreatedResponse({ type: CommentResponseDto })
    @ApiBadRequestResponse({
        description: 'Campos obrigatórios ausentes ou parentId inválido',
    })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async create(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateCommentDto,
    ): Promise<CommentResponseDto> {
        const comment = await this.commentsService.create(postId, dto);
        return comment.toResponseDto();
    }

    @Get(':postId/comments')
    @ApiOperation({
        summary: 'Listar comentários publicados de um post (público)',
        description: 'Retorna a árvore de comentários aninhados.',
    })
    @ApiParam({ name: 'postId', type: Number, example: 1 })
    @ApiOkResponse({ type: [CommentResponseDto] })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async list(
        @Param('postId', ParseIntPipe) postId: number,
    ): Promise<CommentResponseDto[]> {
        const items = await this.commentsService.findPublishedTree(postId);
        return items.map((c) => c.toResponseDto());
    }
}
