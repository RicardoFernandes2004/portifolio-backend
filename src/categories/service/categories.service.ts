import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Category } from 'src/categories/domain/entity/category';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
} from 'src/categories/service/dtos/category.dto';
import type {
    PersistCategoryData,
    UpdateCategoryData,
} from 'src/categories/service/dtos/category.ports';
import { CategoryRepository } from 'src/categories/infra/repositories/category.repository';

@Injectable()
export class CategoriesService {
    constructor(private readonly repository: CategoryRepository) {}

    async findAll(): Promise<Category[]> {
        const rows = await this.repository.findAll();
        return rows.map(Category.fromPrisma);
    }

    async findById(id: number): Promise<Category> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Category ${id} not found`);
        }
        return Category.fromPrisma(row);
    }

    async create(dto: CreateCategoryDto): Promise<Category> {
        const name = (dto.name ?? '').trim();
        if (!name) {
            throw new BadRequestException('name is required');
        }

        const data: PersistCategoryData = { name };
        const created = await this.repository.create(data);
        return Category.fromPrisma(created);
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Category ${id} not found`);
        }

        const data: UpdateCategoryData = {};
        if (dto.name !== undefined) {
            const name = dto.name.trim();
            if (!name) {
                throw new BadRequestException('name cannot be empty');
            }
            data.name = name;
        }

        const updated = await this.repository.update(id, data);
        return Category.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Category ${id} not found`);
        }

        const postsCount = await this.repository.countPosts(id);
        if (postsCount > 0) {
            throw new ConflictException(
                `Category ${id} has ${postsCount} post(s) associated; reassign or delete them before removing this category`,
            );
        }

        await this.repository.delete(id);
    }
}
