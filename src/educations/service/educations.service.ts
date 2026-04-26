import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Education } from 'src/educations/domain/entity/education';
import type {
    CreateEducationDto,
    UpdateEducationDto,
} from 'src/educations/service/dtos/education.dto';
import type {
    PersistEducationData,
    UpdateEducationData,
} from 'src/educations/service/dtos/education.ports';
import { EducationRepository } from 'src/educations/infra/repositories/education.repository';

@Injectable()
export class EducationsService {
    constructor(private readonly repository: EducationRepository) {}

    async findAll(): Promise<Education[]> {
        const rows = await this.repository.findAll();
        return rows.map(Education.fromPrisma);
    }

    async findById(id: number): Promise<Education> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Education ${id} not found`);
        }
        return Education.fromPrisma(row);
    }

    async create(dto: CreateEducationDto): Promise<Education> {
        if (!dto.school || !dto.degree || !dto.fieldOfStudy || !dto.startDate) {
            throw new BadRequestException(
                'school, degree, fieldOfStudy and startDate are required',
            );
        }

        const data: PersistEducationData = {
            school: dto.school,
            degree: dto.degree,
            fieldOfStudy: dto.fieldOfStudy,
            startDate: this.toDate(dto.startDate, 'startDate'),
            endDate: dto.endDate ? this.toDate(dto.endDate, 'endDate') : null,
        };

        this.assertDateRange(data.startDate, data.endDate);

        const created = await this.repository.create(data);
        return Education.fromPrisma(created);
    }

    async update(id: number, dto: UpdateEducationDto): Promise<Education> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Education ${id} not found`);
        }

        const data: UpdateEducationData = {};
        if (dto.school !== undefined) data.school = dto.school;
        if (dto.degree !== undefined) data.degree = dto.degree;
        if (dto.fieldOfStudy !== undefined) data.fieldOfStudy = dto.fieldOfStudy;
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
        return Education.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Education ${id} not found`);
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
