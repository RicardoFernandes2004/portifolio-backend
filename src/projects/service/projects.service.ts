import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Project } from 'src/projects/domain/entity/project';
import type {
    CreateProjectDto,
    UpdateProjectDto,
} from 'src/projects/service/dtos/project.dto';
import type {
    PersistProjectData,
    UpdateProjectData,
} from 'src/projects/service/dtos/project.ports';
import { ProjectRepository } from 'src/projects/infra/repositories/project.repository';

@Injectable()
export class ProjectsService {
    constructor(private readonly repository: ProjectRepository) {}

    async findAll(): Promise<Project[]> {
        const rows = await this.repository.findAll();
        return rows.map(Project.fromPrisma);
    }

    async findById(id: number): Promise<Project> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Project ${id} not found`);
        }
        return Project.fromPrisma(row);
    }

    async create(dto: CreateProjectDto): Promise<Project> {
        if (!dto.title || !dto.description) {
            throw new BadRequestException('title and description are required');
        }

        const data: PersistProjectData = {
            title: dto.title,
            description: dto.description,
            images: dto.images ?? [],
            technologies: dto.technologies ?? [],
            link: dto.link ?? null,
            githubLink: dto.githubLink ?? null,
            youtubeLink: dto.youtubeLink ?? null,
            instagramLink: dto.instagramLink ?? null,
            twitterLink: dto.twitterLink ?? null,
            facebookLink: dto.facebookLink ?? null,
            collaborators: dto.collaborators ?? [],
        };

        const created = await this.repository.create(data);
        return Project.fromPrisma(created);
    }

    async update(id: number, dto: UpdateProjectDto): Promise<Project> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Project ${id} not found`);
        }

        const data: UpdateProjectData = {};
        if (dto.title !== undefined) data.title = dto.title;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.images !== undefined) data.images = dto.images;
        if (dto.technologies !== undefined) data.technologies = dto.technologies;
        if (dto.link !== undefined) data.link = dto.link;
        if (dto.githubLink !== undefined) data.githubLink = dto.githubLink;
        if (dto.youtubeLink !== undefined) data.youtubeLink = dto.youtubeLink;
        if (dto.instagramLink !== undefined) data.instagramLink = dto.instagramLink;
        if (dto.twitterLink !== undefined) data.twitterLink = dto.twitterLink;
        if (dto.facebookLink !== undefined) data.facebookLink = dto.facebookLink;
        if (dto.collaborators !== undefined) data.collaborators = dto.collaborators;

        const updated = await this.repository.update(id, data);
        return Project.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Project ${id} not found`);
        }
        await this.repository.delete(id);
    }
}
