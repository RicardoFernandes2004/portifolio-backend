import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { UploadTicket } from 'src/uploads/domain/entity/upload-ticket';
import type { CreateUploadDto } from 'src/uploads/service/dtos/upload.dto';
import {
    STORAGE_PORT,
    type StoragePort,
} from 'src/uploads/service/dtos/upload.ports';

const ALLOWED_CONTENT_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
]);

const UPLOAD_FOLDER = 'portfolio';

@Injectable()
export class UploadsService {
    constructor(@Inject(STORAGE_PORT) private readonly storage: StoragePort) {}

    async createImageUpload(dto: CreateUploadDto): Promise<UploadTicket> {
        if (!dto?.contentType || !ALLOWED_CONTENT_TYPES.has(dto.contentType)) {
            throw new BadRequestException(
                `contentType must be one of: ${[...ALLOWED_CONTENT_TYPES].join(', ')}`,
            );
        }

        return this.storage.createUploadTicket({
            key: `${UPLOAD_FOLDER}/${randomUUID()}`,
            contentType: dto.contentType,
        });
    }
}
