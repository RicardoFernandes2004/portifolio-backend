import type { Language } from 'src/generated/prisma/client';

export interface PersistLanguageData {
    name: string;
    level: number;
}

export interface UpdateLanguageData {
    name?: string;
    level?: number;
}

export interface LanguageRepositoryPort {
    findAll(): Promise<Language[]>;
    findById(id: number): Promise<Language | null>;
    create(data: PersistLanguageData): Promise<Language>;
    update(id: number, data: UpdateLanguageData): Promise<Language>;
    delete(id: number): Promise<void>;
}
