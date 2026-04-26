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
    CreateSkillDto,
    SkillResponseDto,
    UpdateSkillDto,
} from 'src/skills/service/dtos/skill.dto';
import { SkillsService } from 'src/skills/service/skills.service';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar skills (público)' })
    @ApiOkResponse({ type: [SkillResponseDto] })
    async list(): Promise<SkillResponseDto[]> {
        const items = await this.skillsService.findAll();
        return items.map((s) => s.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar skill por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: SkillResponseDto })
    @ApiNotFoundResponse({ description: 'Skill não encontrada' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<SkillResponseDto> {
        const item = await this.skillsService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar skill (admin)' })
    @ApiBody({ type: CreateSkillDto })
    @ApiCreatedResponse({ type: SkillResponseDto })
    @ApiBadRequestResponse({
        description: 'Campos inválidos / level fora do range',
    })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(@Body() dto: CreateSkillDto): Promise<SkillResponseDto> {
        const created = await this.skillsService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar skill (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateSkillDto })
    @ApiOkResponse({ type: SkillResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Skill não encontrada' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSkillDto,
    ): Promise<SkillResponseDto> {
        const updated = await this.skillsService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar skill (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Skill removida' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Skill não encontrada' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.skillsService.delete(id);
    }
}
