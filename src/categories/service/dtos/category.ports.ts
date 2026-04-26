import type { Category } from 'src/generated/prisma/client';

export interface PersistCategoryData {
    name: string;
}

export interface UpdateCategoryData {
    name?: string;
}

export interface CategoryRepositoryPort {
    findAll(): Promise<Category[]>;
    findById(id: number): Promise<Category | null>;
    create(data: PersistCategoryData): Promise<Category>;
    update(id: number, data: UpdateCategoryData): Promise<Category>;
    delete(id: number): Promise<void>;
    countPosts(id: number): Promise<number>;
}
