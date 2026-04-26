import type { Experience } from 'src/generated/prisma/client';

export interface PersistExperienceData {
    company: string;
    position: string;
    description: string;
    startDate: Date;
    endDate: Date | null;
}

export interface UpdateExperienceData {
    company?: string;
    position?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date | null;
}

export interface ExperienceRepositoryPort {
    findAll(): Promise<Experience[]>;
    findById(id: number): Promise<Experience | null>;
    create(data: PersistExperienceData): Promise<Experience>;
    update(id: number, data: UpdateExperienceData): Promise<Experience>;
    delete(id: number): Promise<void>;
}
