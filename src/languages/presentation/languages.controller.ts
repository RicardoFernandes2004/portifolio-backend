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
    CreateLanguageDto,
    LanguageResponseDto,
    UpdateLanguageDto,
} from 'src/languages/service/dtos/language.dto';
import { LanguagesService } from 'src/languages/service/languages.service';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
    constructor(private readonly languagesService: LanguagesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar idiomas (público)' })
    @ApiOkResponse({ type: [LanguageResponseDto] })
    async list(): Promise<LanguageResponseDto[]> {
        const items = await this.languagesService.findAll();
        return items.map((l) => l.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar idioma por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: LanguageResponseDto })
    @ApiNotFoundResponse({ description: 'Idioma não encontrado' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<LanguageResponseDto> {
        const item = await this.languagesService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar idioma (admin)' })
    @ApiBody({ type: CreateLanguageDto })
    @ApiCreatedResponse({ type: LanguageResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos ou ausentes' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(@Body() dto: CreateLanguageDto): Promise<LanguageResponseDto> {
        const created = await this.languagesService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar idioma (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateLanguageDto })
    @ApiOkResponse({ type: LanguageResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Idioma não encontrado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateLanguageDto,
    ): Promise<LanguageResponseDto> {
        const updated = await this.languagesService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar idioma (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Idioma removido' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Idioma não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.languagesService.delete(id);
    }
}
