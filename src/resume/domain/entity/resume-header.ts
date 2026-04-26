import type { ResumeHeader as PrismaResumeHeader } from 'src/generated/prisma/client';
import type { ResumeHeaderResponseDto } from 'src/resume/service/dtos/resume-header.dto';

export class ResumeHeader {
    private constructor(private readonly props: PrismaResumeHeader) {}

    static fromPrisma(row: PrismaResumeHeader): ResumeHeader {
        return new ResumeHeader(row);
    }

    get id(): number {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get jobTitle(): string {
        return this.props.jobTitle;
    }

    get summary(): string {
        return this.props.summary;
    }

    get location(): string {
        return this.props.location;
    }

    get email(): string {
        return this.props.email;
    }

    get phone(): string {
        return this.props.phone;
    }

    get website(): string {
        return this.props.website;
    }

    get linkedin(): string {
        return this.props.linkedin;
    }

    get github(): string {
        return this.props.github;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): ResumeHeaderResponseDto {
        return {
            id: this.id,
            name: this.name,
            jobTitle: this.jobTitle,
            summary: this.summary,
            location: this.location,
            email: this.email,
            phone: this.phone,
            website: this.website,
            linkedin: this.linkedin,
            github: this.github,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
