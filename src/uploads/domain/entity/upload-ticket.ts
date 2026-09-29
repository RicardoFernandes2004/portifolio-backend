import type { UploadTicketResponseDto } from 'src/uploads/service/dtos/upload.dto';

/**
 * Autorização para o browser enviar um arquivo direto ao storage.
 * Formato agnóstico: POST multipart em `uploadUrl` com `fields` + o arquivo
 * em `fileField`. Serve Cloudinary (signed upload) e S3 (presigned POST).
 */
export class UploadTicket {
    constructor(
        readonly uploadUrl: string,
        readonly fields: Record<string, string>,
        readonly fileField: string,
        readonly publicUrl: string,
    ) {}

    toResponseDto(): UploadTicketResponseDto {
        return {
            uploadUrl: this.uploadUrl,
            fields: this.fields,
            fileField: this.fileField,
            publicUrl: this.publicUrl,
        };
    }
}
