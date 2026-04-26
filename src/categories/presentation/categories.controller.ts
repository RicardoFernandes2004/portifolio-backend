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
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    CategoryResponseDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from 'src/categories/service/dtos/category.dto';
import { CategoriesService } from 'src/categories/service/categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar todas as categorias (público)' })
    @ApiOkResponse({ type: [CategoryResponseDto] })
    async list(): Promise<CategoryResponseDto[]> {
        const items = await this.categoriesService.findAll();
        return items.map((c) => c.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar categoria por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: CategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<CategoryResponseDto> {
        const item = await this.categoriesService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar categoria (admin)' })
    @ApiBody({ type: CreateCategoryDto })
    @ApiCreatedResponse({ type: CategoryResponseDto })
    @ApiBadRequestResponse({ description: 'name é obrigatório' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(
        @Body() dto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const created = await this.categoriesService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar categoria (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateCategoryDto })
    @ApiOkResponse({ type: CategoryResponseDto })
    @ApiBadRequestResponse({ description: 'name não pode ser vazio' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const updated = await this.categoriesService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar categoria (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Categoria removida' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
    @ApiConflictResponse({
        description: 'Categoria possui posts vinculados; remova-os antes',
    })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.categoriesService.delete(id);
    }
}
