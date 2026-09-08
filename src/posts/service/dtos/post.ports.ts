import type { PrismaPostWithCategory } from 'src/posts/domain/entity/post';

export interface PersistPostData {
    slug: string;
    title: string;
    titleEn?: string | null;
    summary: string;
    summaryEn?: string | null;
    content: string;
    contentEn?: string | null;
    images: string[];
    categoryId: number;
    publishedAt: Date | null;
}

export interface UpdatePostData {
    slug?: string;
    title?: string;
    titleEn?: string | null;
    summary?: string;
    summaryEn?: string | null;
    content?: string;
    contentEn?: string | null;
    images?: string[];
    categoryId?: number;
    publishedAt?: Date | null;
}

export interface PostListFilter {
    categoryId?: number;
}

export interface PostRepositoryPort {
    findAllPublished(filter?: PostListFilter): Promise<PrismaPostWithCategory[]>;
    findAllAdmin(filter?: PostListFilter): Promise<PrismaPostWithCategory[]>;
    findById(id: number): Promise<PrismaPostWithCategory | null>;
    findBySlug(slug: string): Promise<PrismaPostWithCategory | null>;
    create(data: PersistPostData): Promise<PrismaPostWithCategory>;
    update(id: number, data: UpdatePostData): Promise<PrismaPostWithCategory>;
    delete(id: number): Promise<void>;
}
