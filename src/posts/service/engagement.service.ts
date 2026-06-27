import { Injectable, NotFoundException } from '@nestjs/common';
import { EngagementRepository } from 'src/posts/infra/repositories/engagement.repository';
import { PostRepository } from 'src/posts/infra/repositories/post.repository';
import type {
    LikeResponseDto,
    ViewResponseDto,
} from 'src/posts/service/dtos/engagement.dto';
import { hashIp } from 'src/posts/service/utils/ip-hash';

@Injectable()
export class EngagementService {
    constructor(
        private readonly repository: EngagementRepository,
        private readonly postRepository: PostRepository,
    ) {}

    async like(postId: number, ip: string | undefined): Promise<LikeResponseDto> {
        await this.assertPostExists(postId);
        const ipHash = hashIp(ip);
        await this.repository.like(postId, ipHash);
        return this.buildLikeResponse(postId, true);
    }

    async unlike(
        postId: number,
        ip: string | undefined,
    ): Promise<LikeResponseDto> {
        await this.assertPostExists(postId);
        const ipHash = hashIp(ip);
        await this.repository.unlike(postId, ipHash);
        return this.buildLikeResponse(postId, false);
    }

    async registerView(
        postId: number,
        ip: string | undefined,
    ): Promise<ViewResponseDto> {
        await this.assertPostExists(postId);
        const ipHash = hashIp(ip);
        await this.repository.registerView(postId, ipHash);
        const viewCount = await this.repository.countViews(postId);
        return { viewCount };
    }

    private async buildLikeResponse(
        postId: number,
        liked: boolean,
    ): Promise<LikeResponseDto> {
        const likeCount = await this.repository.countLikes(postId);
        return { liked, likeCount };
    }

    private async assertPostExists(postId: number): Promise<void> {
        const post = await this.postRepository.findById(postId);
        if (!post) {
            throw new NotFoundException(`Post ${postId} not found`);
        }
    }
}
