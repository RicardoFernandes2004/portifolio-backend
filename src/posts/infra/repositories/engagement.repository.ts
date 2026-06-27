import { Injectable } from '@nestjs/common';
import type { EngagementRepositoryPort } from 'src/posts/service/dtos/engagement.ports';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class EngagementRepository implements EngagementRepositoryPort {
    constructor(private readonly prisma: PrismaService) {}

    async like(postId: number, ipHash: string): Promise<void> {
        await this.prisma.postLike.upsert({
            where: { postId_ipHash: { postId, ipHash } },
            create: { postId, ipHash },
            update: {},
        });
    }

    async unlike(postId: number, ipHash: string): Promise<void> {
        await this.prisma.postLike.deleteMany({ where: { postId, ipHash } });
    }

    async hasLiked(postId: number, ipHash: string): Promise<boolean> {
        const existing = await this.prisma.postLike.findUnique({
            where: { postId_ipHash: { postId, ipHash } },
        });
        return existing !== null;
    }

    async countLikes(postId: number): Promise<number> {
        return this.prisma.postLike.count({ where: { postId } });
    }

    async registerView(postId: number, ipHash: string): Promise<void> {
        await this.prisma.postView.upsert({
            where: { postId_ipHash: { postId, ipHash } },
            create: { postId, ipHash },
            update: {},
        });
    }

    async countViews(postId: number): Promise<number> {
        return this.prisma.postView.count({ where: { postId } });
    }
}
