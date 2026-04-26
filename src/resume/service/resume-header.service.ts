import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ResumeHeader } from 'src/resume/domain/entity/resume-header';
import type { UpdateResumeHeaderDto } from 'src/resume/service/dtos/resume-header.dto';
import type {
    PersistResumeHeader,
    UpdateResumeHeaderData,
} from 'src/resume/service/dtos/resume.ports';
import { ResumeHeaderRepository } from 'src/resume/infra/repositories/resume-header.repository';

@Injectable()
export class ResumeHeaderService {
    constructor(private readonly repository: ResumeHeaderRepository) {}

    async get(): Promise<ResumeHeader> {
        const row = await this.repository.get();
        if (!row) {
            throw new NotFoundException('Resume header has not been configured yet');
        }
        return ResumeHeader.fromPrisma(row);
    }

    async getOrNull(): Promise<ResumeHeader | null> {
        const row = await this.repository.get();
        return row ? ResumeHeader.fromPrisma(row) : null;
    }

    async upsert(dto: UpdateResumeHeaderDto): Promise<ResumeHeader> {
        const existing = await this.repository.get();

        if (existing) {
            const data: UpdateResumeHeaderData = {};
            if (dto.name !== undefined) data.name = dto.name;
            if (dto.jobTitle !== undefined) data.jobTitle = dto.jobTitle;
            if (dto.summary !== undefined) data.summary = dto.summary;
            if (dto.location !== undefined) data.location = dto.location;
            if (dto.email !== undefined) data.email = dto.email;
            if (dto.phone !== undefined) data.phone = dto.phone;
            if (dto.website !== undefined) data.website = dto.website;
            if (dto.linkedin !== undefined) data.linkedin = dto.linkedin;
            if (dto.github !== undefined) data.github = dto.github;

            const updated = await this.repository.update(existing.id, data);
            return ResumeHeader.fromPrisma(updated);
        }

        const required: Array<keyof PersistResumeHeader> = [
            'name',
            'jobTitle',
            'summary',
            'location',
            'email',
            'phone',
            'website',
            'linkedin',
            'github',
        ];

        for (const field of required) {
            if (dto[field] === undefined) {
                throw new BadRequestException(
                    `${field} is required when creating the resume header for the first time`,
                );
            }
        }

        const data: PersistResumeHeader = {
            name: dto.name as string,
            jobTitle: dto.jobTitle as string,
            summary: dto.summary as string,
            location: dto.location as string,
            email: dto.email as string,
            phone: dto.phone as string,
            website: dto.website as string,
            linkedin: dto.linkedin as string,
            github: dto.github as string,
        };

        const created = await this.repository.create(data);
        return ResumeHeader.fromPrisma(created);
    }
}
