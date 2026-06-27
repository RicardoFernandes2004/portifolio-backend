import type {
    Comment as PrismaComment,
    CommentStatus,
} from 'src/generated/prisma/client';

export type PrismaCommentWithReplies = PrismaComment & {
    replies?: PrismaCommentWithReplies[];
};

export interface PersistCommentData {
    postId: number;
    parentId: number | null;
    authorName: string;
    authorEmail: string | null;
    content: string;
    status: CommentStatus;
}

export interface CommentRepositoryPort {
    create(data: PersistCommentData): Promise<PrismaComment>;
    findPublishedByPost(postId: number): Promise<PrismaComment[]>;
    findPending(): Promise<PrismaComment[]>;
    findById(id: number): Promise<PrismaComment | null>;
    approve(id: number): Promise<PrismaComment>;
    delete(id: number): Promise<void>;
}
