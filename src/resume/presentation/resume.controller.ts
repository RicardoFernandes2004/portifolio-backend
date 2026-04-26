import {
    Body,
    Controller,
    Get,
    Put,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiProduces,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    ResumeHeaderResponseDto,
    UpdateResumeHeaderDto,
} from 'src/resume/service/dtos/resume-header.dto';
import { ResumeHeaderService } from 'src/resume/service/resume-header.service';
import { ResumeService } from 'src/resume/service/resume.service';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {
    constructor(
        private readonly headerService: ResumeHeaderService,
        private readonly resumeService: ResumeService,
    ) {}

    @Get('header')
    @ApiOperation({
        summary: 'Obter o header do currículo (público)',
        description:
            'Singleton: sempre retorna o registro único (criado vazio se ainda não existir).',
    })
    @ApiOkResponse({ type: ResumeHeaderResponseDto })
    async getHeader(): Promise<ResumeHeaderResponseDto> {
        const header = await this.headerService.get();
        return header.toResponseDto();
    }

    @Put('header')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Atualizar o header do currículo (admin)',
        description:
            'Faz upsert no registro singleton; envie só os campos que quer alterar.',
    })
    @ApiBody({ type: UpdateResumeHeaderDto })
    @ApiOkResponse({ type: ResumeHeaderResponseDto })
    @ApiBadRequestResponse({ description: 'Campos inválidos' })
    @ApiUnauthorizedResponse({ description: 'JWT ausente, inválido ou revogado' })
    async upsertHeader(
        @Body() dto: UpdateResumeHeaderDto,
    ): Promise<ResumeHeaderResponseDto> {
        const header = await this.headerService.upsert(dto);
        return header.toResponseDto();
    }

    @Get('download')
    @ApiOperation({
        summary: 'Baixar currículo em PDF (gerado dinamicamente)',
        description:
            'Monta o PDF com header + experiências + formações + skills + idiomas + projetos atuais do banco. Sem cache.',
    })
    @ApiProduces('application/pdf')
    @ApiOkResponse({
        description: 'PDF binário (download)',
        schema: { type: 'string', format: 'binary' },
    })
    async download(@Res() res: Response): Promise<void> {
        const buffer = await this.resumeService.getPdf();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="curriculum.pdf"',
            'Content-Length': buffer.length.toString(),
        });
        res.send(buffer);
    }
}
