import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EducationsModule } from 'src/educations/educations.module';
import { ExperiencesModule } from 'src/experiences/experiences.module';
import { LanguagesModule } from 'src/languages/languages.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { SkillsModule } from 'src/skills/skills.module';
import { PrismaService } from '../../prisma/prisma.service';
import { ResumeHeaderRepository } from './infra/repositories/resume-header.repository';
import { ResumeController } from './presentation/resume.controller';
import { ResumeHeaderService } from './service/resume-header.service';
import { ResumePdfService } from './service/resume-pdf.service';
import { ResumeService } from './service/resume.service';

@Module({
    imports: [
        AuthModule,
        ExperiencesModule,
        EducationsModule,
        SkillsModule,
        LanguagesModule,
        ProjectsModule,
    ],
    controllers: [ResumeController],
    providers: [
        PrismaService,
        ResumeHeaderRepository,
        ResumeHeaderService,
        ResumePdfService,
        ResumeService,
    ],
    exports: [ResumeHeaderService, ResumeService],
})
export class ResumeModule {}
