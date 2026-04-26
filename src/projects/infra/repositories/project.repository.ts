import { Injectable } from '@nestjs/common';
import type { Project } from 'src/generated/prisma/client';
import type {
    PersistProjectData,
    ProjectRepositoryPort,
    UpdateProjectData,
} from 'src/projects/service/dtos/project.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ProjectRepository implements ProjectRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Project[]> {
        return this.prisma.project.findMany({
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        });
    }

    async findById(id: number): Promise<Project | null> {
        return this.prisma.project.findUnique({ where: { id } });
    }

    async create(data: PersistProjectData): Promise<Project> {
        return this.prisma.project.create({ data });
    }

    async update(id: number, data: UpdateProjectData): Promise<Project> {
        return this.prisma.project.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.project.delete({ where: { id } });
    }
}
