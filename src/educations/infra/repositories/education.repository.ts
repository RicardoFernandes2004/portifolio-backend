import { Injectable } from '@nestjs/common';
import type { Education } from 'src/generated/prisma/client';
import type {
    EducationRepositoryPort,
    PersistEducationData,
    UpdateEducationData,
} from 'src/educations/service/dtos/education.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class EducationRepository implements EducationRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Education[]> {
        return this.prisma.education.findMany({
            orderBy: [{ startDate: 'desc' }, { id: 'desc' }],
        });
    }

    async findById(id: number): Promise<Education | null> {
        return this.prisma.education.findUnique({ where: { id } });
    }

    async create(data: PersistEducationData): Promise<Education> {
        return this.prisma.education.create({ data });
    }

    async update(id: number, data: UpdateEducationData): Promise<Education> {
        return this.prisma.education.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.education.delete({ where: { id } });
    }
}
