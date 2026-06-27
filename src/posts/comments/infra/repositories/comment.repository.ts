import { Injectable } from '@nestjs/common';
import type { Comment as PrismaComment } from 'src/generated/prisma/client';
import type {
    CommentRepositoryPort,
    PersistCommentData,
} from 'src/posts/comments/service/dtos/comment.ports';
import { PrismaService } from '../../../../../prisma/prisma.service';

@Injectable()
export class CommentRepository implements CommentRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: PersistCommentData): Promise<PrismaComment> {
        return this.prisma.comment.create({ data });
    }

    async findPublishedByPost(postId: number): Promise<PrismaComment[]> {
        return this.prisma.comment.findMany({
            where: { postId, status: 'PUBLISHED' },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        });
    }

    async findPending(): Promise<PrismaComment[]> {
        return this.prisma.comment.findMany({
            where: { status: 'PENDING' },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    }

    async findById(id: number): Promise<PrismaComment | null> {
        return this.prisma.comment.findUnique({ where: { id } });
    }

    async approve(id: number): Promise<PrismaComment> {
        return this.prisma.comment.update({
            where: { id },
            data: { status: 'PUBLISHED' },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.comment.delete({ where: { id } });
    }
}
