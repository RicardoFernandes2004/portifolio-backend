import type { Project } from 'src/generated/prisma/client';

export interface PersistProjectData {
    title: string;
    description: string;
    images: string[];
    technologies: string[];
    link: string | null;
    githubLink: string | null;
    youtubeLink: string | null;
    instagramLink: string | null;
    twitterLink: string | null;
    facebookLink: string | null;
    collaborators: string[];
}

export interface UpdateProjectData {
    title?: string;
    description?: string;
    images?: string[];
    technologies?: string[];
    link?: string | null;
    githubLink?: string | null;
    youtubeLink?: string | null;
    instagramLink?: string | null;
    twitterLink?: string | null;
    facebookLink?: string | null;
    collaborators?: string[];
}

export interface ProjectRepositoryPort {
    findAll(): Promise<Project[]>;
    findById(id: number): Promise<Project | null>;
    create(data: PersistProjectData): Promise<Project>;
    update(id: number, data: UpdateProjectData): Promise<Project>;
    delete(id: number): Promise<void>;
}
