import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ExperienceRepository } from './infra/repositories/experience.repository';
import { ExperiencesController } from './presentation/experiences.controller';
import { ExperiencesService } from './service/experiences.service';

@Module({
    imports: [AuthModule],
    controllers: [ExperiencesController],
    providers: [PrismaService, ExperienceRepository, ExperiencesService],
    exports: [ExperiencesService],
})
export class ExperiencesModule {}
