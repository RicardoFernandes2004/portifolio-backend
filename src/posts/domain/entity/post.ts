import type {
    Category as PrismaCategory,
    Post as PrismaPost,
} from 'src/generated/prisma/client';
import { Category } from 'src/categories/domain/entity/category';
import { PostResponseDto } from 'src/posts/service/dtos/post.dto';

export type PostEngagementCounts = {
    comments: number;
    likes: number;
    views: number;
};

export type PrismaPostWithCategory = PrismaPost & {
    category?: PrismaCategory;
    _count?: PostEngagementCounts;
};

export class Post {
    private constructor(
        private readonly props: PrismaPost,
        private readonly _category: Category | null,
        private readonly _counts: PostEngagementCounts,
    ) {}

    static fromPrisma(row: PrismaPostWithCategory): Post {
        const category = row.category ? Category.fromPrisma(row.category) : null;
        const counts: PostEngagementCounts = {
            comments: row._count?.comments ?? 0,
            likes: row._count?.likes ?? 0,
            views: row._count?.views ?? 0,
        };
        return new Post(row, category, counts);
    }

    get id(): number {
        return this.props.id;
    }

    get slug(): string {
        return this.props.slug;
    }

    get title(): string {
        return this.props.title;
    }

    get summary(): string {
        return this.props.summary;
    }

    get content(): string {
        return this.props.content;
    }

    get images(): string[] {
        return this.props.images;
    }

    get categoryId(): number {
        return this.props.categoryId;
    }

    get category(): Category | null {
        return this._category;
    }

    get publishedAt(): Date | null {
        return this.props.publishedAt;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    get isPublished(): boolean {
        const at = this.props.publishedAt;
        return at !== null && at.getTime() <= Date.now();
    }

    get commentCount(): number {
        return this._counts.comments;
    }

    get likeCount(): number {
        return this._counts.likes;
    }

    get viewCount(): number {
        return this._counts.views;
    }

    toResponseDto(): PostResponseDto {
        const dto = new PostResponseDto();
        dto.id = this.id;
        dto.slug = this.slug;
        dto.title = this.title;
        dto.summary = this.summary;
        dto.content = this.content;
        dto.images = this.images;
        dto.categoryId = this.categoryId;
        dto.category = this._category ? this._category.toResponseDto() : null;
        dto.publishedAt = this.publishedAt;
        dto.isPublished = this.isPublished;
        dto.commentCount = this.commentCount;
        dto.likeCount = this.likeCount;
        dto.viewCount = this.viewCount;
        dto.createdAt = this.createdAt;
        dto.updatedAt = this.updatedAt;
        return dto;
    }
}
