import type { Experience as PrismaExperience } from 'src/generated/prisma/client';
import type { ExperienceResponseDto } from 'src/experiences/service/dtos/experience.dto';

export class Experience {
    private constructor(private readonly props: PrismaExperience) {}

    static fromPrisma(row: PrismaExperience): Experience {
        return new Experience(row);
    }

    get id(): number {
        return this.props.id;
    }

    get company(): string {
        return this.props.company;
    }

    get position(): string {
        return this.props.position;
    }

    get description(): string {
        return this.props.description;
    }

    get startDate(): Date {
        return this.props.startDate;
    }

    get endDate(): Date | null {
        return this.props.endDate;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): ExperienceResponseDto {
        return {
            id: this.id,
            company: this.company,
            position: this.position,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
