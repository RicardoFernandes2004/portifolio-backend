import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadDto {
    @ApiProperty({ example: 'image/png' })
    contentType!: string;
}

export class UploadTicketResponseDto {
    @ApiProperty({
        example: 'https://api.cloudinary.com/v1_1/demo/image/upload',
    })
    uploadUrl!: string;

    @ApiProperty({
        example: { api_key: '123', timestamp: '1700000000', signature: '...' },
        description: 'Campos a enviar junto do arquivo no multipart',
    })
    fields!: Record<string, string>;

    @ApiProperty({ example: 'file' })
    fileField!: string;

    @ApiProperty({
        example: 'https://res.cloudinary.com/demo/image/upload/portfolio/abc',
    })
    publicUrl!: string;
}
