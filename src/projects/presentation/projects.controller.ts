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
    CreateProjectDto,
    ProjectResponseDto,
    UpdateProjectDto,
} from 'src/projects/service/dtos/project.dto';
import { ProjectsService } from 'src/projects/service/projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar projetos (público)' })
    @ApiOkResponse({ type: [ProjectResponseDto] })
    async list(): Promise<ProjectResponseDto[]> {
        const items = await this.projectsService.findAll();
        return items.map((p) => p.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar projeto por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: ProjectResponseDto })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ProjectResponseDto> {
        const item = await this.projectsService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar projeto (admin)' })
    @ApiBody({ type: CreateProjectDto })
    @ApiCreatedResponse({ type: ProjectResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos ou ausentes' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
        const created = await this.projectsService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar projeto (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateProjectDto })
    @ApiOkResponse({ type: ProjectResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProjectDto,
    ): Promise<ProjectResponseDto> {
        const updated = await this.projectsService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar projeto (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Projeto removido' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.projectsService.delete(id);
    }
}
