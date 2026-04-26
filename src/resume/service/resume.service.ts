import { Injectable } from '@nestjs/common';
import { EducationsService } from 'src/educations/service/educations.service';
import { ExperiencesService } from 'src/experiences/service/experiences.service';
import { LanguagesService } from 'src/languages/service/languages.service';
import { ProjectsService } from 'src/projects/service/projects.service';
import type { ResumeAggregate } from 'src/resume/domain/entity/resume';
import { ResumeHeaderService } from 'src/resume/service/resume-header.service';
import { ResumePdfService } from 'src/resume/service/resume-pdf.service';
import { SkillsService } from 'src/skills/service/skills.service';

@Injectable()
export class ResumeService {
    constructor(
        private readonly headerService: ResumeHeaderService,
        private readonly experiencesService: ExperiencesService,
        private readonly educationsService: EducationsService,
        private readonly skillsService: SkillsService,
        private readonly languagesService: LanguagesService,
        private readonly projectsService: ProjectsService,
        private readonly pdfService: ResumePdfService,
    ) {}

    async getAggregate(): Promise<ResumeAggregate> {
        const [header, experiences, educations, skills, languages, projects] =
            await Promise.all([
                this.headerService.get(),
                this.experiencesService.findAll(),
                this.educationsService.findAll(),
                this.skillsService.findAll(),
                this.languagesService.findAll(),
                this.projectsService.findAll(),
            ]);

        return { header, experiences, educations, skills, languages, projects };
    }

    async getPdf(): Promise<Buffer> {
        const aggregate = await this.getAggregate();
        return this.pdfService.build(aggregate);
    }
}
