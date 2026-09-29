import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
    CreateUploadDto,
    UploadTicketResponseDto,
} from 'src/uploads/service/dtos/upload.dto';
import { UploadsService } from 'src/uploads/service/uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary:
            'Gerar autorização para upload direto de imagem ao storage (admin)',
    })
    @ApiBody({ type: CreateUploadDto })
    @ApiCreatedResponse({ type: UploadTicketResponseDto })
    @ApiBadRequestResponse({ description: 'contentType não permitido' })
    @ApiUnauthorizedResponse({
        description: 'JWT ausente, inválido ou revogado',
    })
    async create(
        @Body() dto: CreateUploadDto,
    ): Promise<UploadTicketResponseDto> {
        const ticket = await this.uploadsService.createImageUpload(dto);
        return ticket.toResponseDto();
    }
}
