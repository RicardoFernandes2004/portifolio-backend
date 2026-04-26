import type { Project as PrismaProject } from 'src/generated/prisma/client';
import type { ProjectResponseDto } from 'src/projects/service/dtos/project.dto';

export class Project {
    private constructor(private readonly props: PrismaProject) {}

    static fromPrisma(row: PrismaProject): Project {
        return new Project(row);
    }

    get id(): number {
        return this.props.id;
    }

    get title(): string {
        return this.props.title;
    }

    get description(): string {
        return this.props.description;
    }

    get images(): string[] {
        return this.props.images;
    }

    get technologies(): string[] {
        return this.props.technologies;
    }

    get link(): string | null {
        return this.props.link;
    }

    get githubLink(): string | null {
        return this.props.githubLink;
    }

    get youtubeLink(): string | null {
        return this.props.youtubeLink;
    }

    get instagramLink(): string | null {
        return this.props.instagramLink;
    }

    get twitterLink(): string | null {
        return this.props.twitterLink;
    }

    get facebookLink(): string | null {
        return this.props.facebookLink;
    }

    get collaborators(): string[] {
        return this.props.collaborators;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): ProjectResponseDto {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            images: this.images,
            technologies: this.technologies,
            link: this.link,
            githubLink: this.githubLink,
            youtubeLink: this.youtubeLink,
            instagramLink: this.instagramLink,
            twitterLink: this.twitterLink,
            facebookLink: this.facebookLink,
            collaborators: this.collaborators,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
