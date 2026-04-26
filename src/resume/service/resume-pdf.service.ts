import { Injectable } from '@nestjs/common';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Education } from 'src/educations/domain/entity/education';
import type { Experience } from 'src/experiences/domain/entity/experience';
import type { Language } from 'src/languages/domain/entity/language';
import type { Project } from 'src/projects/domain/entity/project';
import type { ResumeAggregate } from 'src/resume/domain/entity/resume';
import type { ResumeHeader } from 'src/resume/domain/entity/resume-header';
import type { ResumePdfPort } from 'src/resume/service/dtos/resume.ports';
import type { Skill } from 'src/skills/domain/entity/skill';

import * as helveticaFont from 'pdfmake/standard-fonts/Helvetica';

import pdfMake = require('pdfmake');

@Injectable()
export class ResumePdfService implements ResumePdfPort {
    private fontsRegistered = false;

    async build(resume: ResumeAggregate): Promise<Buffer> {
        this.ensureFonts();

        const docDefinition: TDocumentDefinitions = {
            pageMargins: [40, 40, 40, 40],
            defaultStyle: { font: 'Helvetica', fontSize: 10, lineHeight: 1.25 },
            styles: {
                name: { fontSize: 22, bold: true },
                jobTitle: { fontSize: 12, italics: true, color: '#555555' },
                sectionTitle: {
                    fontSize: 13,
                    bold: true,
                    margin: [0, 12, 0, 6],
                    color: '#222222',
                },
                entryTitle: { fontSize: 11, bold: true },
                entrySubtitle: { italics: true, color: '#444444' },
                entryPeriod: { color: '#666666', fontSize: 9 },
                contactLine: { fontSize: 9, color: '#444444' },
            },
            content: this.buildContent(resume),
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

    private buildContent(resume: ResumeAggregate): Content[] {
        const content: Content[] = [];

        content.push(...this.buildHeaderSection(resume.header));

        if (resume.header.summary) {
            content.push({ text: 'Summary', style: 'sectionTitle' });
            content.push({ text: resume.header.summary });
        }

        if (resume.experiences.length > 0) {
            content.push({ text: 'Experience', style: 'sectionTitle' });
            content.push(...resume.experiences.map((e) => this.renderExperience(e)));
        }

        if (resume.educations.length > 0) {
            content.push({ text: 'Education', style: 'sectionTitle' });
            content.push(...resume.educations.map((e) => this.renderEducation(e)));
        }

        if (resume.projects.length > 0) {
            content.push({ text: 'Projects', style: 'sectionTitle' });
            content.push(...resume.projects.map((p) => this.renderProject(p)));
        }

        if (resume.skills.length > 0) {
            content.push({ text: 'Skills', style: 'sectionTitle' });
            content.push(this.renderLeveledList(resume.skills));
        }

        if (resume.languages.length > 0) {
            content.push({ text: 'Languages', style: 'sectionTitle' });
            content.push(this.renderLeveledList(resume.languages));
        }

        return content;
    }

    private buildHeaderSection(header: ResumeHeader): Content[] {
        const contactItems: string[] = [];
        if (header.email) contactItems.push(header.email);
        if (header.phone) contactItems.push(header.phone);
        if (header.location) contactItems.push(header.location);
        if (header.website) contactItems.push(header.website);
        if (header.linkedin) contactItems.push(header.linkedin);
        if (header.github) contactItems.push(header.github);

        const items: Content[] = [
            { text: header.name, style: 'name' },
            { text: header.jobTitle, style: 'jobTitle', margin: [0, 0, 0, 6] },
        ];

        if (contactItems.length > 0) {
            items.push({ text: contactItems.join('  •  '), style: 'contactLine' });
        }

        return items;
    }

    private renderExperience(experience: Experience): Content {
        const period = this.formatPeriod(experience.startDate, experience.endDate);
        return {
            margin: [0, 0, 0, 8],
            stack: [
                {
                    columns: [
                        { text: experience.position, style: 'entryTitle' },
                        { text: period, style: 'entryPeriod', alignment: 'right' },
                    ],
                },
                { text: experience.company, style: 'entrySubtitle' },
                { text: experience.description, margin: [0, 4, 0, 0] },
            ],
        };
    }

    private renderEducation(education: Education): Content {
        const period = this.formatPeriod(education.startDate, education.endDate);
        return {
            margin: [0, 0, 0, 8],
            stack: [
                {
                    columns: [
                        {
                            text: `${education.degree} in ${education.fieldOfStudy}`,
                            style: 'entryTitle',
                        },
                        { text: period, style: 'entryPeriod', alignment: 'right' },
                    ],
                },
                { text: education.school, style: 'entrySubtitle' },
            ],
        };
    }

    private renderProject(project: Project): Content {
        const stack: Content[] = [
            { text: project.title, style: 'entryTitle' },
        ];

        if (project.technologies.length > 0) {
            stack.push({
                text: project.technologies.join(' • '),
                style: 'entryPeriod',
            });
        }

        if (project.description) {
            stack.push({ text: project.description, margin: [0, 4, 0, 0] });
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

        return { margin: [0, 0, 0, 8], stack };
    }

    private renderLeveledList(items: Array<Skill | Language>): Content {
        return {
            table: {
                widths: ['*', 120],
                body: items.map((item) => [
                    { text: item.name, margin: [0, 2, 0, 2] },
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

    private formatPeriod(start: Date, end: Date | null): string {
        const startLabel = this.formatMonthYear(start);
        const endLabel = end ? this.formatMonthYear(end) : 'Present';
        return `${startLabel} – ${endLabel}`;
    }

    private formatMonthYear(date: Date): string {
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${year}`;
    }
}
