import { Injectable } from '@nestjs/common';
import type { Category } from 'src/generated/prisma/client';
import type {
    CategoryRepositoryPort,
    PersistCategoryData,
    UpdateCategoryData,
} from 'src/categories/service/dtos/category.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class CategoryRepository implements CategoryRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    }

    async findById(id: number): Promise<Category | null> {
        return this.prisma.category.findUnique({ where: { id } });
    }

    async create(data: PersistCategoryData): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async update(id: number, data: UpdateCategoryData): Promise<Category> {
        return this.prisma.category.update({ where: { id }, data });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.category.delete({ where: { id } });
    }

    async countPosts(id: number): Promise<number> {
        return this.prisma.post.count({ where: { categoryId: id } });
    }
}
