import type { Education } from 'src/generated/prisma/client';

export interface PersistEducationData {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate: Date | null;
}

export interface UpdateEducationData {
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: Date;
    endDate?: Date | null;
}

export interface EducationRepositoryPort {
    findAll(): Promise<Education[]>;
    findById(id: number): Promise<Education | null>;
    create(data: PersistEducationData): Promise<Education>;
    update(id: number, data: UpdateEducationData): Promise<Education>;
    delete(id: number): Promise<void>;
}
