import { Injectable } from '@nestjs/common';
import type { ResumeHeader } from 'src/generated/prisma/client';
import type {
    PersistResumeHeader,
    ResumeHeaderRepositoryPort,
    UpdateResumeHeaderData,
} from 'src/resume/service/dtos/resume.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ResumeHeaderRepository implements ResumeHeaderRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async get(): Promise<ResumeHeader | null> {
        return this.prisma.resumeHeader.findFirst({
            orderBy: { id: 'asc' },
        });
    }

    async create(data: PersistResumeHeader): Promise<ResumeHeader> {
        return this.prisma.resumeHeader.create({ data });
    }

    async update(
        id: number,
        data: UpdateResumeHeaderData,
    ): Promise<ResumeHeader> {
        return this.prisma.resumeHeader.update({ where: { id }, data });
    }
}
