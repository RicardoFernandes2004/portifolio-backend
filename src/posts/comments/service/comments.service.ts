import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { Comment as PrismaComment } from 'src/generated/prisma/client';
import { Comment } from 'src/posts/comments/domain/entity/comment';
import type { CreateCommentDto } from 'src/posts/comments/service/dtos/comment.dto';
import type { PersistCommentData } from 'src/posts/comments/service/dtos/comment.ports';
import { CommentRepository } from 'src/posts/comments/infra/repositories/comment.repository';
import { PostRepository } from 'src/posts/infra/repositories/post.repository';
import { containsBlacklistedWord } from 'src/posts/service/utils/comment-blacklist';

@Injectable()
export class CommentsService {
    constructor(
        private readonly repository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) {}

    async create(postId: number, dto: CreateCommentDto): Promise<Comment> {
        await this.assertPostExists(postId);

        const authorName = (dto.authorName ?? '').trim();
        const content = (dto.content ?? '').trim();
        if (!authorName || !content) {
            throw new BadRequestException(
                'authorName and content are required',
            );
        }

        const parentId = await this.resolveParentId(postId, dto.parentId);
        const authorEmail = dto.authorEmail?.trim() || null;
        const status = containsBlacklistedWord(content) ? 'PENDING' : 'PUBLISHED';

        const data: PersistCommentData = {
            postId,
            parentId,
            authorName,
            authorEmail,
            content,
            status,
        };

        const created = await this.repository.create(data);
        return Comment.fromPrisma(created);
    }

    async findPublishedTree(postId: number): Promise<Comment[]> {
        await this.assertPostExists(postId);
        const rows = await this.repository.findPublishedByPost(postId);
        return this.buildTree(rows);
    }

    async findPending(): Promise<Comment[]> {
        const rows = await this.repository.findPending();
        return rows.map((row) => Comment.fromPrisma(row));
    }

    async approve(id: number): Promise<Comment> {
        await this.assertCommentExists(id);
        const updated = await this.repository.approve(id);
        return Comment.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        await this.assertCommentExists(id);
        await this.repository.delete(id);
    }

    private buildTree(rows: PrismaComment[]): Comment[] {
        const childrenByParent = new Map<number, PrismaComment[]>();
        const roots: PrismaComment[] = [];

        for (const row of rows) {
            if (row.parentId === null) {
                roots.push(row);
                continue;
            }
            const siblings = childrenByParent.get(row.parentId) ?? [];
            siblings.push(row);
            childrenByParent.set(row.parentId, siblings);
        }

        const toEntity = (row: PrismaComment): Comment => {
            const children = childrenByParent.get(row.id) ?? [];
            return Comment.fromPrisma(row, children.map(toEntity));
        };

        return roots.map(toEntity);
    }

    private async resolveParentId(
        postId: number,
        parentId: number | null | undefined,
    ): Promise<number | null> {
        if (parentId === null || parentId === undefined) {
            return null;
        }
        const parent = await this.repository.findById(parentId);
        if (!parent || parent.postId !== postId) {
            throw new BadRequestException(
                `Parent comment ${parentId} does not belong to post ${postId}`,
            );
        }
        return parent.id;
    }

    private async assertPostExists(postId: number): Promise<void> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException(`Post ${postId} not found`);
        }
    }

    private async assertCommentExists(id: number): Promise<void> {
        const comment = await this.repository.findById(id);
        if (!comment) {
            throw new NotFoundException(`Comment ${id} not found`);
        }
    }
}
