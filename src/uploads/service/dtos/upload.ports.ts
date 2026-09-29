import type { UploadTicket } from 'src/uploads/domain/entity/upload-ticket';

export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface CreateUploadTicketData {
    /** Caminho final do arquivo no storage, sem extensão (ex: portfolio/<uuid>). */
    key: string;
    contentType: string;
}

export interface StoragePort {
    createUploadTicket(data: CreateUploadTicketData): Promise<UploadTicket>;
}
