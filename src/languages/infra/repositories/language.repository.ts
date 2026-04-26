import { Injectable } from '@nestjs/common';
import type { Language } from 'src/generated/prisma/client';
import type {
    LanguageRepositoryPort,
    PersistLanguageData,
    UpdateLanguageData,
} from 'src/languages/service/dtos/language.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class LanguageRepository implements LanguageRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Language[]> {
        return this.prisma.language.findMany({
            orderBy: [{ level: 'desc' }, { name: 'asc' }],
        });
    }

    async findById(id: number): Promise<Language | null> {
        return this.prisma.language.findUnique({ where: { id } });
    }

    async create(data: PersistLanguageData): Promise<Language> {
        return this.prisma.language.create({ data });
    }

    async update(id: number, data: UpdateLanguageData): Promise<Language> {
        return this.prisma.language.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.language.delete({ where: { id } });
    }
}
