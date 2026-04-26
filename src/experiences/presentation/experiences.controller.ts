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
    CreateExperienceDto,
    ExperienceResponseDto,
    UpdateExperienceDto,
} from 'src/experiences/service/dtos/experience.dto';
import { ExperiencesService } from 'src/experiences/service/experiences.service';

@ApiTags('experiences')
@Controller('experiences')
export class ExperiencesController {
    constructor(private readonly experiencesService: ExperiencesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar experiências profissionais (público)' })
    @ApiOkResponse({ type: [ExperienceResponseDto] })
    async list(): Promise<ExperienceResponseDto[]> {
        const items = await this.experiencesService.findAll();
        return items.map((e) => e.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar experiência por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: ExperienceResponseDto })
    @ApiNotFoundResponse({ description: 'Experiência não encontrada' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ExperienceResponseDto> {
        const item = await this.experiencesService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar experiência (admin)' })
    @ApiBody({ type: CreateExperienceDto })
    @ApiCreatedResponse({ type: ExperienceResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos ou ausentes' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(@Body() dto: CreateExperienceDto): Promise<ExperienceResponseDto> {
        const created = await this.experiencesService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar experiência (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateExperienceDto })
    @ApiOkResponse({ type: ExperienceResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Experiência não encontrada' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExperienceDto,
    ): Promise<ExperienceResponseDto> {
        const updated = await this.experiencesService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar experiência (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Experiência removida' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Experiência não encontrada' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.experiencesService.delete(id);
    }
}
