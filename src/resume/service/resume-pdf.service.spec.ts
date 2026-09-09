import { ResumePdfService } from './resume-pdf.service';
import type { ResumeAggregate } from '../domain/entity/resume';

/**
 * O PDF sai como binario, entao a checagem mira o documento antes da
 * serializacao: buildContent e privado, mas e ele que decide PT vs EN.
 */
function contentOf(
    service: ResumePdfService,
    resume: ResumeAggregate,
    locale: 'pt' | 'en',
): string {
    const build = (
        service as unknown as {
            buildContent: (r: ResumeAggregate, l: 'pt' | 'en') => unknown;
        }
    ).buildContent.bind(service);
    return JSON.stringify(build(resume, locale));
}

const resume = {
    header: {
        name: 'Ricardo',
        jobTitle: 'Desenvolvedor Full-Stack',
        jobTitleEn: 'Full-Stack Developer',
        summary: 'Resumo em portugues',
        summaryEn: 'Summary in english',
        email: 'a@b.c',
        phone: null,
        location: null,
        website: null,
        linkedin: null,
        github: null,
    },
    experiences: [
        {
            company: 'Acme',
            position: 'Estagiario',
            positionEn: 'Intern',
            description: 'Descricao PT',
            descriptionEn: 'Description EN',
            startDate: new Date('2024-01-01'),
            endDate: null,
        },
    ],
    educations: [
        {
            school: 'USP',
            degree: 'Bacharelado',
            degreeEn: 'Bachelor',
            fieldOfStudy: 'Computacao',
            fieldOfStudyEn: 'Computer Science',
            startDate: new Date('2023-01-01'),
            endDate: null,
        },
    ],
    skills: [{ name: 'TypeScript', level: 5 }],
    languages: [{ name: 'Ingles', nameEn: 'English', level: 4 }],
    projects: [
        {
            title: 'Loja',
            titleEn: 'Store',
            description: 'Descricao do projeto',
            descriptionEn: 'Project description',
            technologies: ['Next.js'],
            link: null,
            githubLink: null,
            youtubeLink: null,
        },
    ],
} as unknown as ResumeAggregate;

describe('ResumePdfService', () => {
    const service = new ResumePdfService();

    it('monta o PDF em portugues por padrao', () => {
        const json = contentOf(service, resume, 'pt');

        expect(json).toContain('Desenvolvedor Full-Stack');
        expect(json).toContain('Resumo em portugues');
        expect(json).toContain('Descricao PT');
        expect(json).toContain('Experiência');
        expect(json).toContain('Atual');
        expect(json).not.toContain('Full-Stack Developer');
    });

    it('usa os campos EN quando o locale e en', () => {
        const json = contentOf(service, resume, 'en');

        expect(json).toContain('Full-Stack Developer');
        expect(json).toContain('Summary in english');
        expect(json).toContain('Description EN');
        expect(json).toContain('Bachelor in Computer Science');
        expect(json).toContain('Store');
        expect(json).toContain('English');
        expect(json).toContain('Experience');
        expect(json).toContain('Present');
        expect(json).not.toContain('Resumo em portugues');
    });

    it('cai para o PT quando a traducao esta vazia', () => {
        const semTraducao = {
            ...resume,
            header: { ...resume.header, summaryEn: null, jobTitleEn: null },
        } as unknown as ResumeAggregate;

        const json = contentOf(service, semTraducao, 'en');

        expect(json).toContain('Resumo em portugues');
        expect(json).toContain('Desenvolvedor Full-Stack');
    });
});
