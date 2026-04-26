import type { Education } from 'src/educations/domain/entity/education';
import type { Experience } from 'src/experiences/domain/entity/experience';
import type { Language } from 'src/languages/domain/entity/language';
import type { Project } from 'src/projects/domain/entity/project';
import type { ResumeHeader } from 'src/resume/domain/entity/resume-header';
import type { Skill } from 'src/skills/domain/entity/skill';

export interface ResumeAggregate {
    header: ResumeHeader;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    languages: Language[];
    projects: Project[];
}
