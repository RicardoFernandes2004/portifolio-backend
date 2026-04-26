import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { PrismaService } from '../../prisma/prisma.service';
import { PostRepository } from './infra/repositories/post.repository';
import { PostsController } from './presentation/posts.controller';
import { PostsService } from './service/posts.service';

@Module({
    imports: [AuthModule, CategoriesModule],
    controllers: [PostsController],
    providers: [PrismaService, PostRepository, PostsService],
    exports: [PostsService],
})
export class PostsModule {}
