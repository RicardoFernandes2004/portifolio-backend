import { Injectable } from '@nestjs/common';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Education } from 'src/educations/domain/entity/education';
import type { Experience } from 'src/experiences/domain/entity/experience';
import type { Project } from 'src/projects/domain/entity/project';
import type { ResumeAggregate } from 'src/resume/domain/entity/resume';
import type { ResumeHeader } from 'src/resume/domain/entity/resume-header';
import type {
    ResumeFormat,
    ResumeLocale,
    ResumePdfPort,
} from 'src/resume/service/dtos/resume.ports';

import * as helveticaFont from 'pdfmake/standard-fonts/Helvetica';

import pdfMake = require('pdfmake');

const LABELS = {
    pt: {
        summary: 'Resumo',
        experience: 'Experiência',
        education: 'Formação',
        projects: 'Projetos',
        skills: 'Habilidades',
        languages: 'Idiomas',
        present: 'Atual',
        degreeIn: 'em',
    },
    en: {
        summary: 'Summary',
        experience: 'Experience',
        education: 'Education',
        projects: 'Projects',
        skills: 'Skills',
        languages: 'Languages',
        present: 'Present',
        degreeIn: 'in',
    },
} as const;

@Injectable()
export class ResumePdfService implements ResumePdfPort {
    private fontsRegistered = false;

    async build(
        resume: ResumeAggregate,
        locale: ResumeLocale,
        format: ResumeFormat = 'full',
    ): Promise<Buffer> {
        this.ensureFonts();
        const onePage = format === 'onepage';

        const docDefinition: TDocumentDefinitions = {
            pageMargins: onePage ? [36, 30, 36, 30] : [40, 40, 40, 40],
            defaultStyle: {
                font: 'Helvetica',
                fontSize: onePage ? 9 : 10,
                lineHeight: onePage ? 1.15 : 1.25,
            },
            styles: {
                name: { fontSize: onePage ? 18 : 22, bold: true },
                jobTitle: { fontSize: onePage ? 11 : 12, italics: true, color: '#555555' },
                sectionTitle: {
                    fontSize: onePage ? 11 : 13,
                    bold: true,
                    margin: onePage ? [0, 8, 0, 3] : [0, 12, 0, 6],
                    color: '#222222',
                },
                entryTitle: { fontSize: 11, bold: true },
                entrySubtitle: { italics: true, color: '#444444' },
                entryPeriod: { color: '#666666', fontSize: 9 },
                contactLine: { fontSize: 9, color: '#444444' },
            },
            content: this.buildContent(resume, locale, onePage),
        };

        const doc = pdfMake.createPdf(docDefinition);
        return doc.getBuffer();
    }

    private ensureFonts(): void {
        if (this.fontsRegistered) return;
        pdfMake.setFonts({ ...helveticaFont });
        (pdfMake as unknown as { setUrlAccessPolicy: (cb: (url: string) => boolean) => void }).setUrlAccessPolicy(
            () => false,
        );
        this.fontsRegistered = true;
    }

    /** Traducao com fallback: campo *En vazio cai para o PT. */
    private tr(locale: ResumeLocale, pt: string, en: string | null): string {
        return locale === 'en' && en ? en : pt;
    }

    /** onePage: projetos so com o paragrafo de abertura, skills e idiomas em linha. */
    private buildContent(
        resume: ResumeAggregate,
        locale: ResumeLocale,
        onePage = false,
    ): Content[] {
        const t = LABELS[locale];
        const content: Content[] = [];

        content.push(...this.buildHeaderSection(resume.header, locale));

        if (resume.header.summary) {
            content.push({ text: t.summary, style: 'sectionTitle' });
            content.push({
                text: this.tr(
                    locale,
                    resume.header.summary,
                    resume.header.summaryEn,
                ),
            });
        }

        if (resume.experiences.length > 0) {
            content.push({ text: t.experience, style: 'sectionTitle' });
            content.push(
                ...resume.experiences.map((e) =>
                    this.renderExperience(e, locale, onePage),
                ),
            );
        }

        if (resume.educations.length > 0) {
            content.push({ text: t.education, style: 'sectionTitle' });
            content.push(
                ...resume.educations.map((e) => this.renderEducation(e, locale)),
            );
        }

        if (resume.projects.length > 0) {
            content.push({ text: t.projects, style: 'sectionTitle' });
            content.push(
                ...resume.projects.map((p) =>
                    this.renderProject(p, locale, onePage),
                ),
            );
        }

        if (resume.skills.length > 0) {
            content.push({ text: t.skills, style: 'sectionTitle' });
            content.push(
                onePage
                    ? { text: resume.skills.map((s) => s.name).join('  •  ') }
                    : this.renderLeveledList(
                          resume.skills.map((s) => ({
                              label: s.name,
                              level: s.level,
                          })),
                      ),
            );
        }

        if (resume.languages.length > 0) {
            content.push({ text: t.languages, style: 'sectionTitle' });
            const languages = resume.languages.map((l) => ({
                label: this.tr(locale, l.name, l.nameEn),
                level: l.level,
            }));
            content.push(
                onePage
                    ? { text: languages.map((l) => l.label).join('  •  ') }
                    : this.renderLeveledList(languages),
            );
        }

        return content;
    }

    private buildHeaderSection(
        header: ResumeHeader,
        locale: ResumeLocale,
    ): Content[] {
        const contactItems: string[] = [];
        if (header.email) contactItems.push(header.email);
        if (header.phone) contactItems.push(header.phone);
        if (header.location) contactItems.push(header.location);
        if (header.website) contactItems.push(header.website);
        if (header.linkedin) contactItems.push(header.linkedin);
        if (header.github) contactItems.push(header.github);

        const items: Content[] = [
            { text: header.name, style: 'name' },
            {
                text: this.tr(locale, header.jobTitle, header.jobTitleEn),
                style: 'jobTitle',
                margin: [0, 0, 0, 6],
            },
        ];

        if (contactItems.length > 0) {
            items.push({ text: contactItems.join('  •  '), style: 'contactLine' });
        }

        return items;
    }

    private renderExperience(
        experience: Experience,
        locale: ResumeLocale,
        onePage = false,
    ): Content {
        const period = this.formatPeriod(
            experience.startDate,
            experience.endDate,
            locale,
        );
        return {
            margin: [0, 0, 0, 8],
            stack: [
                {
                    columns: [
                        {
                            text: this.tr(
                                locale,
                                experience.position,
                                experience.positionEn,
                            ),
                            style: 'entryTitle',
                        },
                        { text: period, style: 'entryPeriod', alignment: 'right' },
                    ],
                },
                { text: experience.company, style: 'entrySubtitle' },
                {
                    text: this.compact(
                        this.tr(
                            locale,
                            experience.description,
                            experience.descriptionEn,
                        ),
                        onePage,
                    ),
                    margin: onePage ? [0, 2, 0, 0] : [0, 4, 0, 0],
                },
            ],
        };
    }

    private renderEducation(
        education: Education,
        locale: ResumeLocale,
    ): Content {
        const period = this.formatPeriod(
            education.startDate,
            education.endDate,
            locale,
        );
        const degree = this.tr(locale, education.degree, education.degreeEn);
        const field = this.tr(
            locale,
            education.fieldOfStudy,
            education.fieldOfStudyEn,
        );
        return {
            margin: [0, 0, 0, 8],
            stack: [
                {
                    columns: [
                        {
                            text: `${degree} ${LABELS[locale].degreeIn} ${field}`,
                            style: 'entryTitle',
                        },
                        { text: period, style: 'entryPeriod', alignment: 'right' },
                    ],
                },
                { text: education.school, style: 'entrySubtitle' },
            ],
        };
    }

    private renderProject(
        project: Project,
        locale: ResumeLocale,
        onePage = false,
    ): Content {
        const stack: Content[] = [
            {
                text: this.tr(locale, project.title, project.titleEn),
                style: 'entryTitle',
            },
        ];

        // No onepage a secao de skills ja cobre a stack.
        if (!onePage && project.technologies.length > 0) {
            stack.push({
                text: project.technologies.join(' • '),
                style: 'entryPeriod',
            });
        }

        if (project.description) {
            const description = this.tr(
                locale,
                project.description,
                project.descriptionEn,
            );
            stack.push({
                text: onePage ? this.tagline(description) : description,
                margin: onePage ? [0, 1, 0, 0] : [0, 4, 0, 0],
            });
        }

        const links: string[] = [];
        if (project.link) links.push(project.link);
        if (project.githubLink) links.push(project.githubLink);
        if (project.youtubeLink) links.push(project.youtubeLink);
        if (links.length > 0) {
            stack.push({
                text: links.join('  •  '),
                style: 'contactLine',
                margin: [0, 2, 0, 0],
            });
        }

        return { margin: onePage ? [0, 0, 0, 5] : [0, 0, 0, 8], stack };
    }

    /** Junta paragrafos (linhas em branco viram quebra simples) para caber em uma pagina. */
    private compact(text: string, onePage: boolean): string {
        return onePage ? text.replace(/\n\s*\n/g, '\n') : text;
    }

    /** Paragrafo de abertura; se for longo, so a primeira frase. */
    private tagline(text: string): string {
        const first = text.split(/\n\s*\n/)[0];
        if (first.length <= 220) return first;
        const sentence = /^.+?[.!?](?=\s)/s.exec(first);
        return sentence ? sentence[0] : first;
    }

    private renderLeveledList(
        items: Array<{ label: string; level: number }>,
    ): Content {
        return {
            table: {
                widths: ['*', 120],
                body: items.map((item) => [
                    { text: item.label, margin: [0, 2, 0, 2] },
                    this.renderLevelBar(item.level),
                ]),
            },
            layout: 'noBorders',
        };
    }

    private renderLevelBar(level: number): Content {
        const max = 5;
        const filled = Math.max(0, Math.min(max, Math.round(level)));
        const totalWidth = 80;
        const barHeight = 6;
        const segmentWidth = totalWidth / max;
        const filledWidth = filled * segmentWidth;
        const emptyWidth = totalWidth - filledWidth;

        const canvasShapes: Array<{
            type: 'rect';
            x: number;
            y: number;
            w: number;
            h: number;
            color: string;
        }> = [];
        if (filledWidth > 0) {
            canvasShapes.push({
                type: 'rect',
                x: 0,
                y: 0,
                w: filledWidth,
                h: barHeight,
                color: '#444444',
            });
        }
        if (emptyWidth > 0) {
            canvasShapes.push({
                type: 'rect',
                x: filledWidth,
                y: 0,
                w: emptyWidth,
                h: barHeight,
                color: '#dddddd',
            });
        }

        return {
            margin: [0, 6, 0, 2],
            columns: [
                {
                    width: totalWidth,
                    canvas: canvasShapes,
                },
                {
                    width: 'auto',
                    text: `${level}/${max}`,
                    color: '#444444',
                    margin: [6, -2, 0, 0],
                    fontSize: 9,
                },
            ],
        };
    }

    private formatPeriod(
        start: Date,
        end: Date | null,
        locale: ResumeLocale,
    ): string {
        const startLabel = this.formatMonthYear(start);
        const endLabel = end
            ? this.formatMonthYear(end)
            : LABELS[locale].present;
        return `${startLabel} – ${endLabel}`;
    }

    private formatMonthYear(date: Date): string {
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${year}`;
    }
}
