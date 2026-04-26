import { Injectable } from '@nestjs/common';
import type { PrismaPostWithCategory } from 'src/posts/domain/entity/post';
import type {
    PersistPostData,
    PostListFilter,
    PostRepositoryPort,
    UpdatePostData,
} from 'src/posts/service/dtos/post.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PostRepository implements PostRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAllPublished(
        filter?: PostListFilter,
    ): Promise<PrismaPostWithCategory[]> {
        return this.prisma.post.findMany({
            where: {
                publishedAt: { not: null, lte: new Date() },
                ...(filter?.categoryId !== undefined && {
                    categoryId: filter.categoryId,
                }),
            },
            orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
            include: { category: true },
        });
    }

    async findAllAdmin(
        filter?: PostListFilter,
    ): Promise<PrismaPostWithCategory[]> {
        return this.prisma.post.findMany({
            where: {
                ...(filter?.categoryId !== undefined && {
                    categoryId: filter.categoryId,
                }),
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: { category: true },
        });
    }

    async findById(id: number): Promise<PrismaPostWithCategory | null> {
        return this.prisma.post.findUnique({
            where: { id },
            include: { category: true },
        });
    }

    async findBySlug(slug: string): Promise<PrismaPostWithCategory | null> {
        return this.prisma.post.findUnique({
            where: { slug },
            include: { category: true },
        });
    }

    async create(data: PersistPostData): Promise<PrismaPostWithCategory> {
        return this.prisma.post.create({
            data,
            include: { category: true },
        });
    }

    async update(
        id: number,
        data: UpdatePostData,
    ): Promise<PrismaPostWithCategory> {
        return this.prisma.post.update({
            where: { id },
            data,
            include: { category: true },
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.post.delete({ where: { id } });
    }
}
