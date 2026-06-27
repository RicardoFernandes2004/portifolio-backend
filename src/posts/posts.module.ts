import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentRepository } from './comments/infra/repositories/comment.repository';
import { CommentsController } from './comments/presentation/comments.controller';
import { CommentsService } from './comments/service/comments.service';
import { EngagementRepository } from './infra/repositories/engagement.repository';
import { PostRepository } from './infra/repositories/post.repository';
import { PostsController } from './presentation/posts.controller';
import { EngagementService } from './service/engagement.service';
import { PostsService } from './service/posts.service';

@Module({
    imports: [AuthModule, CategoriesModule],
    controllers: [PostsController, CommentsController],
    providers: [
        PrismaService,
        PostRepository,
        PostsService,
        CommentRepository,
        CommentsService,
        EngagementRepository,
        EngagementService,
    ],
    exports: [PostsService],
})
export class PostsModule {}
