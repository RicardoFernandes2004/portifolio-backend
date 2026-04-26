import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRepository } from './infra/repositories/project.repository';
import { ProjectsController } from './presentation/projects.controller';
import { ProjectsService } from './service/projects.service';

@Module({
    imports: [AuthModule],
    controllers: [ProjectsController],
    providers: [PrismaService, ProjectRepository, ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule {}
