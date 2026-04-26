import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Language } from 'src/languages/domain/entity/language';
import type {
    CreateLanguageDto,
    UpdateLanguageDto,
} from 'src/languages/service/dtos/language.dto';
import type {
    PersistLanguageData,
    UpdateLanguageData,
} from 'src/languages/service/dtos/language.ports';
import { LanguageRepository } from 'src/languages/infra/repositories/language.repository';

@Injectable()
export class LanguagesService {
    constructor(private readonly repository: LanguageRepository) {}

    async findAll(): Promise<Language[]> {
        const rows = await this.repository.findAll();
        return rows.map(Language.fromPrisma);
    }

    async findById(id: number): Promise<Language> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Language ${id} not found`);
        }
        return Language.fromPrisma(row);
    }

    async create(dto: CreateLanguageDto): Promise<Language> {
        if (!dto.name || dto.level === undefined || dto.level === null) {
            throw new BadRequestException('name and level are required');
        }
        this.assertLevel(dto.level);

        const data: PersistLanguageData = {
            name: dto.name,
            level: dto.level,
        };

        const created = await this.repository.create(data);
        return Language.fromPrisma(created);
    }

    async update(id: number, dto: UpdateLanguageDto): Promise<Language> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Language ${id} not found`);
        }

        const data: UpdateLanguageData = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.level !== undefined) {
            this.assertLevel(dto.level);
            data.level = dto.level;
        }

        const updated = await this.repository.update(id, data);
        return Language.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Language ${id} not found`);
        }
        await this.repository.delete(id);
    }

    private assertLevel(level: number): void {
        if (!Number.isInteger(level) || level < 1 || level > 5) {
            throw new BadRequestException('level must be an integer between 1 and 5');
        }
    }
}
