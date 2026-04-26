import { Injectable } from '@nestjs/common';
import type { Skill } from 'src/generated/prisma/client';
import type {
    PersistSkillData,
    SkillRepositoryPort,
    UpdateSkillData,
} from 'src/skills/service/dtos/skill.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SkillRepository implements SkillRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Skill[]> {
        return this.prisma.skill.findMany({
            orderBy: [{ level: 'desc' }, { name: 'asc' }],
        });
    }

    async findById(id: number): Promise<Skill | null> {
        return this.prisma.skill.findUnique({ where: { id } });
    }

    async create(data: PersistSkillData): Promise<Skill> {
        return this.prisma.skill.create({ data });
    }

    async update(id: number, data: UpdateSkillData): Promise<Skill> {
        return this.prisma.skill.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.skill.delete({ where: { id } });
    }
}
