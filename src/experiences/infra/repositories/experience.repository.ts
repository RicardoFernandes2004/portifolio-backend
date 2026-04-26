import { Injectable } from '@nestjs/common';
import type { Experience } from 'src/generated/prisma/client';
import type {
    ExperienceRepositoryPort,
    PersistExperienceData,
    UpdateExperienceData,
} from 'src/experiences/service/dtos/experience.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ExperienceRepository implements ExperienceRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Experience[]> {
        return this.prisma.experience.findMany({
            orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
        });
    }

    async findById(id: number): Promise<Experience | null> {
        return this.prisma.experience.findUnique({ where: { id } });
    }

    async create(data: PersistExperienceData): Promise<Experience> {
        return this.prisma.experience.create({ data });
    }

    async update(id: number, data: UpdateExperienceData): Promise<Experience> {
        return this.prisma.experience.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.experience.delete({ where: { id } });
    }
}
