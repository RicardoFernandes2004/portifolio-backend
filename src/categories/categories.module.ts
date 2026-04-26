import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryRepository } from './infra/repositories/category.repository';
import { CategoriesController } from './presentation/categories.controller';
import { CategoriesService } from './service/categories.service';

@Module({
    imports: [AuthModule],
    controllers: [CategoriesController],
    providers: [PrismaService, CategoryRepository, CategoriesService],
    exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}
