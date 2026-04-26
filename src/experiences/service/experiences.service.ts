import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Experience } from 'src/experiences/domain/entity/experience';
import type {
    CreateExperienceDto,
    UpdateExperienceDto,
} from 'src/experiences/service/dtos/experience.dto';
import type {
    PersistExperienceData,
    UpdateExperienceData,
} from 'src/experiences/service/dtos/experience.ports';
import { ExperienceRepository } from 'src/experiences/infra/repositories/experience.repository';

@Injectable()
export class ExperiencesService {
    constructor(private readonly repository: ExperienceRepository) {}

    async findAll(): Promise<Experience[]> {
        const rows = await this.repository.findAll();
        return rows.map(Experience.fromPrisma);
    }

    async findById(id: number): Promise<Experience> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Experience ${id} not found`);
        }
        return Experience.fromPrisma(row);
    }

    async create(dto: CreateExperienceDto): Promise<Experience> {
        if (!dto.company || !dto.position || !dto.description || !dto.startDate) {
            throw new BadRequestException(
                'company, position, description and startDate are required',
            );
        }

        const data: PersistExperienceData = {
            company: dto.company,
            position: dto.position,
            description: dto.description,
            startDate: this.toDate(dto.startDate, 'startDate'),
            endDate: dto.endDate ? this.toDate(dto.endDate, 'endDate') : null,
        };

        this.assertDateRange(data.startDate, data.endDate);

        const created = await this.repository.create(data);
        return Experience.fromPrisma(created);
    }

    async update(id: number, dto: UpdateExperienceDto): Promise<Experience> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Experience ${id} not found`);
        }

        const data: UpdateExperienceData = {};
        if (dto.company !== undefined) data.company = dto.company;
        if (dto.position !== undefined) data.position = dto.position;
        if (dto.description !== undefined) data.description = dto.description;
        if (dto.startDate !== undefined)
            data.startDate = this.toDate(dto.startDate, 'startDate');
        if (dto.endDate !== undefined) {
            data.endDate = dto.endDate === null ? null : this.toDate(dto.endDate, 'endDate');
        }

        const startDate = data.startDate ?? existing.startDate;
        const endDate =
            data.endDate !== undefined ? data.endDate : existing.endDate;
        this.assertDateRange(startDate, endDate);

        const updated = await this.repository.update(id, data);
        return Experience.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Experience ${id} not found`);
        }
        await this.repository.delete(id);
    }

    private toDate(value: string | Date, field: string): Date {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${field} is not a valid date`);
        }
        return date;
    }

    private assertDateRange(startDate: Date, endDate: Date | null): void {
        if (endDate && endDate.getTime() < startDate.getTime()) {
            throw new BadRequestException('endDate must be after startDate');
        }
    }
}
