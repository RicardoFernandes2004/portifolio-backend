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
    CreateEducationDto,
    EducationResponseDto,
    UpdateEducationDto,
} from 'src/educations/service/dtos/education.dto';
import { EducationsService } from 'src/educations/service/educations.service';

@ApiTags('educations')
@Controller('educations')
export class EducationsController {
    constructor(private readonly educationsService: EducationsService) {}

    @Get()
    @ApiOperation({ summary: 'Listar formações acadêmicas (público)' })
    @ApiOkResponse({ type: [EducationResponseDto] })
    async list(): Promise<EducationResponseDto[]> {
        const items = await this.educationsService.findAll();
        return items.map((e) => e.toResponseDto());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalhar formação por id (público)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiOkResponse({ type: EducationResponseDto })
    @ApiNotFoundResponse({ description: 'Formação não encontrada' })
    async detail(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<EducationResponseDto> {
        const item = await this.educationsService.findById(id);
        return item.toResponseDto();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Criar formação (admin)' })
    @ApiBody({ type: CreateEducationDto })
    @ApiCreatedResponse({ type: EducationResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos ou ausentes' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async create(@Body() dto: CreateEducationDto): Promise<EducationResponseDto> {
        const created = await this.educationsService.create(dto);
        return created.toResponseDto();
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Atualizar formação (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiBody({ type: UpdateEducationDto })
    @ApiOkResponse({ type: EducationResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Formação não encontrada' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEducationDto,
    ): Promise<EducationResponseDto> {
        const updated = await this.educationsService.update(id, dto);
        return updated.toResponseDto();
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar formação (admin)' })
    @ApiParam({ name: 'id', type: Number, example: 1 })
    @ApiNoContentResponse({ description: 'Formação removida' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    @ApiNotFoundResponse({ description: 'Formação não encontrada' })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.educationsService.delete(id);
    }
}
