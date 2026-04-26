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
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    CreatePostDto,
    PostResponseDto,
    UpdatePostDto,
} from 'src/posts/service/dtos/post.dto';
import { PostsService } from 'src/posts/service/posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get()
    @ApiOperation({
        summary: 'Listar posts publicados (público)',
        description:
            'Retorna apenas posts com publishedAt já alcançado. Admin deve usar GET /posts/admin.',
    })
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: Number,
        example: 1,
    })
    @ApiOkResponse({ type: [PostResponseDto] })
    async list(
        @Query('categoryId') categoryId?: string,
    ): Promise<PostResponseDto[]> {
        const filter = this.parseCategoryFilter(categoryId);
        const items = await this.postsService.findAllPublic(filter);
        return items.map((p) => p.toResponseDto());
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Listar TODOS os posts incluindo drafts (admin)',
    })
    @ApiQuery({
        name: 'categoryId',
        required: false,
        type: Number,
        example: 1,
    })
    @ApiOkResponse({ type: [PostResponseDto] })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async listAdmin(
        @Query('categoryId') categoryId?: string,
    ): Promise<PostResponseDto[]> {
        const filter = this.parseCategoryFilter(categoryId);
        const items = await this.postsService.findAllAdmin(filter);
        return items.map((p) => p.toResponseDto());
    }

    @Get('slug/:slug')
    @ApiOperation({
        summary: 'Detalhar post por slug (público) - rota canônica do blog',
    })
    @ApiParam({ name: 'slug', example: 'jwt-stateful-nestjs' })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async detailBySlug(@Param('slug') slug: string): Promise<PostResponseDto> {
        const post = await this.postsService.findBySlug(slug);
        return post.toResponseDto();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar post por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PostResponseDto> {
        const post = await this.postsService.findById(id);
        return post.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar post (admin)' })
    @ApiBody({ type: CreatePostDto })
    @ApiCreatedResponse({ type: PostResponseDto })
    @ApiBadRequestResponse({
        description:
            'Campos obrigatórios ausentes, categoryId inexistente, slug indeducível ou publishedAt inválido',
    })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiConflictResponse({ description: 'Slug já em uso' })
    async create(@Body() dto: CreatePostDto): Promise<PostResponseDto> {
        const created = await this.postsService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar post (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdatePostDto })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiBadRequestResponse({
        description:
            'Campos inválidos, categoryId inexistente, slug indeducível ou publishedAt inválido',
    })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    @ApiConflictResponse({ description: 'Novo slug já em uso por outro post' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePostDto,
    ): Promise<PostResponseDto> {
        const updated = await this.postsService.update(id, dto);
        return updated.toResponseDto();
    }

    @Post(':id/publish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Publicar post agora (admin) - define publishedAt = now',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async publish(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PostResponseDto> {
        const post = await this.postsService.publish(id);
        return post.toResponseDto();
    }

    @Post(':id/unpublish')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Despublicar post (admin) - define publishedAt = null',
    })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async unpublish(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PostResponseDto> {
        const post = await this.postsService.unpublish(id);
        return post.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar post (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Post removido' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Post não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.postsService.delete(id);
    }

    private parseCategoryFilter(
        raw: string | undefined,
    ): { categoryId?: number } | undefined {
        if (raw === undefined || raw === '') return undefined;
        const parsed = Number(raw);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return undefined;
        }
        return { categoryId: parsed };
    }
}
