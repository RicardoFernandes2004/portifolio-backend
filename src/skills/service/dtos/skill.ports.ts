import type { Skill } from 'src/generated/prisma/client';

export interface PersistSkillData {
    name: string;
    level: number;
    description: string | null;
    icon: string | null;
}

export interface UpdateSkillData {
    name?: string;
    level?: number;
    description?: string | null;
    icon?: string | null;
}

export interface SkillRepositoryPort {
    findAll(): Promise<Skill[]>;
    findById(id: number): Promise<Skill | null>;
    create(data: PersistSkillData): Promise<Skill>;
    update(id: number, data: UpdateSkillData): Promise<Skill>;
    delete(id: number): Promise<void>;
}
