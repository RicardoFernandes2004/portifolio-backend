import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { UploadTicket } from 'src/uploads/domain/entity/upload-ticket';
import type {
    CreateUploadTicketData,
    StoragePort,
} from 'src/uploads/service/dtos/upload.ports';

/**
 * Assinatura do Cloudinary: params ordenados por chave, `k=v` unidos por `&`,
 * concatenados com o secret e passados em SHA-1.
 * https://cloudinary.com/documentation/authentication_signatures
 */
export function signCloudinaryParams(
    params: Record<string, string>,
    apiSecret: string,
): string {
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&');
    return createHash('sha1')
        .update(toSign + apiSecret)
        .digest('hex');
}

@Injectable()
export class CloudinaryStorage implements StoragePort {
    createUploadTicket(data: CreateUploadTicketData): Promise<UploadTicket> {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
            throw new InternalServerErrorException(
                'Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)',
            );
        }

        const signed = {
            public_id: data.key,
            timestamp: String(Math.floor(Date.now() / 1000)),
        };

        return Promise.resolve(
            new UploadTicket(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    ...signed,
                    api_key: apiKey,
                    signature: signCloudinaryParams(signed, apiSecret),
                },
                'file',
                `https://res.cloudinary.com/${cloudName}/image/upload/${data.key}`,
            ),
        );
    }
}
