import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Skill } from 'src/skills/domain/entity/skill';
import type {
    CreateSkillDto,
    UpdateSkillDto,
} from 'src/skills/service/dtos/skill.dto';
import type {
    PersistSkillData,
    UpdateSkillData,
} from 'src/skills/service/dtos/skill.ports';
import { SkillRepository } from 'src/skills/infra/repositories/skill.repository';

@Injectable()
export class SkillsService {
    constructor(private readonly repository: SkillRepository) {}

    async findAll(): Promise<Skill[]> {
        const rows = await this.repository.findAll();
        return rows.map(Skill.fromPrisma);
    }

    async findById(id: number): Promise<Skill> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Skill ${id} not found`);
        }
        return Skill.fromPrisma(row);
    }

    async create(dto: CreateSkillDto): Promise<Skill> {
        if (!dto.name || dto.level === undefined || dto.level === null) {
            throw new BadRequestException('name and level are required');
        }
        this.assertLevel(dto.level);

        const data: PersistSkillData = {
            name: dto.name,
            level: dto.level,
            description: dto.description ?? null,
            icon: dto.icon ?? null,
        };

        const created = await this.repository.create(data);
        return Skill.fromPrisma(created);
    }

    async update(id: number, dto: UpdateSkillDto): Promise<Skill> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Skill ${id} not found`);
        }

        const data: UpdateSkillData = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.level !== undefined) {
            this.assertLevel(dto.level);
            data.level = dto.level;
        }
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.icon !== undefined) data.icon = dto.icon;

        const updated = await this.repository.update(id, data);
        return Skill.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Skill ${id} not found`);
        }
        await this.repository.delete(id);
    }

    private assertLevel(level: number): void {
        if (!Number.isInteger(level) || level < 1 || level > 5) {
            throw new BadRequestException('level must be an integer between 1 and 5');
        }
    }
}
