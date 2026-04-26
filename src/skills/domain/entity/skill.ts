import type { Skill as PrismaSkill } from 'src/generated/prisma/client';
import type { SkillResponseDto } from 'src/skills/service/dtos/skill.dto';

export class Skill {
    private constructor(private readonly props: PrismaSkill) {}

    static fromPrisma(row: PrismaSkill): Skill {
        return new Skill(row);
    }

    get id(): number {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get level(): number {
        return this.props.level;
    }

    get description(): string | null {
        return this.props.description;
    }

    get icon(): string | null {
        return this.props.icon;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): SkillResponseDto {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            description: this.description,
            icon: this.icon,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
