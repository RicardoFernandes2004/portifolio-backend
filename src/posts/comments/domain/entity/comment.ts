import type { Comment as PrismaComment } from 'src/generated/prisma/client';
import { CommentResponseDto } from 'src/posts/comments/service/dtos/comment.dto';

export class Comment {
    private constructor(
        private readonly props: PrismaComment,
        private readonly _replies: Comment[],
    ) {}

    static fromPrisma(row: PrismaComment, replies: Comment[] = []): Comment {
        return new Comment(row, replies);
    }

    get id(): number {
        return this.props.id;
    }

    get postId(): number {
        return this.props.postId;
    }

    get parentId(): number | null {
        return this.props.parentId;
    }

    get authorName(): string {
        return this.props.authorName;
    }

    get content(): string {
        return this.props.content;
    }

    get status(): string {
        return this.props.status;
    }

    get replies(): Comment[] {
        return this._replies;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): CommentResponseDto {
        const dto = new CommentResponseDto();
        dto.id = this.id;
        dto.postId = this.postId;
        dto.parentId = this.parentId;
        dto.authorName = this.authorName;
        dto.content = this.content;
        dto.status = this.status;
        dto.replies = this._replies.map((r) => r.toResponseDto());
        dto.createdAt = this.createdAt;
        dto.updatedAt = this.updatedAt;
        return dto;
    }
}
