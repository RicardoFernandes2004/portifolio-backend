import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from 'src/categories/infra/repositories/category.repository';
import { Post } from 'src/posts/domain/entity/post';
import type {
    CreatePostDto,
    UpdatePostDto,
} from 'src/posts/service/dtos/post.dto';
import type {
    PersistPostData,
    PostListFilter,
    UpdatePostData,
} from 'src/posts/service/dtos/post.ports';
import { PostRepository } from 'src/posts/infra/repositories/post.repository';
import { slugify } from 'src/posts/service/utils/slugify';

@Injectable()
export class PostsService {
    constructor(
        private readonly repository: PostRepository,
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async findAllPublic(filter?: PostListFilter): Promise<Post[]> {
        const rows = await this.repository.findAllPublished(filter);
        return rows.map(Post.fromPrisma);
    }

    async findAllAdmin(filter?: PostListFilter): Promise<Post[]> {
        const rows = await this.repository.findAllAdmin(filter);
        return rows.map(Post.fromPrisma);
    }

    async findById(id: number): Promise<Post> {
        const row = await this.repository.findById(id);
        if (!row) {
            throw new NotFoundException(`Post ${id} not found`);
        }
        return Post.fromPrisma(row);
    }

    async findBySlug(slug: string): Promise<Post> {
        const row = await this.repository.findBySlug(slug);
        if (!row) {
            throw new NotFoundException(`Post '${slug}' not found`);
        }
        return Post.fromPrisma(row);
    }

    async create(dto: CreatePostDto): Promise<Post> {
        const title = (dto.title ?? '').trim();
        const summary = (dto.summary ?? '').trim();
        const content = (dto.content ?? '').trim();
        if (!title || !summary || !content) {
            throw new BadRequestException(
                'title, summary and content are required',
            );
        }
        if (dto.categoryId === undefined || dto.categoryId === null) {
            throw new BadRequestException('categoryId is required');
        }

        await this.assertCategoryExists(dto.categoryId);

        const slug = this.deriveSlug(dto.slug, title);
        await this.assertSlugUnique(slug);

        const data: PersistPostData = {
            slug,
            title,
            summary,
            content,
            images: dto.images ?? [],
            categoryId: dto.categoryId,
            publishedAt: this.toDateOrNull(dto.publishedAt, 'publishedAt'),
        };

        const created = await this.repository.create(data);
        return Post.fromPrisma(created);
    }

    async update(id: number, dto: UpdatePostDto): Promise<Post> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Post ${id} not found`);
        }

        const data: UpdatePostData = {};

        if (dto.title !== undefined) {
            const title = dto.title.trim();
            if (!title) throw new BadRequestException('title cannot be empty');
            data.title = title;
        }
        if (dto.summary !== undefined) {
            const summary = dto.summary.trim();
            if (!summary)
                throw new BadRequestException('summary cannot be empty');
            data.summary = summary;
        }
        if (dto.content !== undefined) {
            const content = dto.content.trim();
            if (!content)
                throw new BadRequestException('content cannot be empty');
            data.content = content;
        }
        if (dto.categoryId !== undefined) {
            await this.assertCategoryExists(dto.categoryId);
            data.categoryId = dto.categoryId;
        }
        if (dto.images !== undefined) {
            data.images = dto.images;
        }
        if (dto.publishedAt !== undefined) {
            data.publishedAt = this.toDateOrNull(
                dto.publishedAt,
                'publishedAt',
            );
        }

        if (dto.slug !== undefined || dto.title !== undefined) {
            const baseSource =
                dto.slug !== undefined
                    ? dto.slug
                    : (data.title ?? existing.title);
            const newSlug = this.deriveSlug(
                dto.slug !== undefined ? dto.slug : undefined,
                baseSource,
            );
            if (newSlug !== existing.slug) {
                await this.assertSlugUnique(newSlug, id);
            }
            data.slug = newSlug;
        }

        const updated = await this.repository.update(id, data);
        return Post.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Post ${id} not found`);
        }
        await this.repository.delete(id);
    }

    async publish(id: number): Promise<Post> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Post ${id} not found`);
        }
        const updated = await this.repository.update(id, {
            publishedAt: new Date(),
        });
        return Post.fromPrisma(updated);
    }

    async unpublish(id: number): Promise<Post> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Post ${id} not found`);
        }
        const updated = await this.repository.update(id, {
            publishedAt: null,
        });
        return Post.fromPrisma(updated);
    }

    private async assertCategoryExists(categoryId: number): Promise<void> {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
            throw new BadRequestException(
                `Category ${categoryId} does not exist`,
            );
        }
    }

    private async assertSlugUnique(
        slug: string,
        ignorePostId?: number,
    ): Promise<void> {
        const existing = await this.repository.findBySlug(slug);
        if (existing && existing.id !== ignorePostId) {
            throw new ConflictException(`Slug '${slug}' is already in use`);
        }
    }

    private deriveSlug(
        explicit: string | undefined,
        fallback: string,
    ): string {
        const source = explicit && explicit.trim() ? explicit : fallback;
        const slug = slugify(source);
        if (!slug) {
            throw new BadRequestException(
                'Could not derive a valid slug; provide a slug with alphanumeric characters',
            );
        }
        return slug;
    }

    private toDateOrNull(
        value: string | Date | null | undefined,
        field: string,
    ): Date | null {
        if (value === null || value === undefined) return null;
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${field} is not a valid date`);
        }
        return date;
    }
}
