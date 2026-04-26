import type { Education as PrismaEducation } from 'src/generated/prisma/client';
import type { EducationResponseDto } from 'src/educations/service/dtos/education.dto';

export class Education {
    private constructor(private readonly props: PrismaEducation) {}

    static fromPrisma(row: PrismaEducation): Education {
        return new Education(row);
    }

    get id(): number {
        return this.props.id;
    }

    get school(): string {
        return this.props.school;
    }

    get degree(): string {
        return this.props.degree;
    }

    get fieldOfStudy(): string {
        return this.props.fieldOfStudy;
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

    toResponseDto(): EducationResponseDto {
        return {
            id: this.id,
            school: this.school,
            degree: this.degree,
            fieldOfStudy: this.fieldOfStudy,
            startDate: this.startDate,
            endDate: this.endDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
