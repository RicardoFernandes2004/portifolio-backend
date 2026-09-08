import type { ResumeHeader as PrismaResumeHeader } from 'src/generated/prisma/client';
import type { ResumeAggregate } from 'src/resume/domain/entity/resume';

export interface PersistResumeHeader {
    name: string;
    jobTitle: string;
    jobTitleEn?: string | null;
    summary: string;
    summaryEn?: string | null;
    location: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
}

export interface UpdateResumeHeaderData {
    name?: string;
    jobTitle?: string;
    jobTitleEn?: string | null;
    summary?: string;
    summaryEn?: string | null;
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
}

export interface ResumeHeaderRepositoryPort {
    get(): Promise<PrismaResumeHeader | null>;
    create(data: PersistResumeHeader): Promise<PrismaResumeHeader>;
    update(id: number, data: UpdateResumeHeaderData): Promise<PrismaResumeHeader>;
}

export interface ResumePdfPort {
    build(resume: ResumeAggregate): Promise<Buffer>;
}
