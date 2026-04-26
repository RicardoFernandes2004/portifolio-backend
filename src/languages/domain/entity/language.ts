import type { Language as PrismaLanguage } from 'src/generated/prisma/client';
import type { LanguageResponseDto } from 'src/languages/service/dtos/language.dto';

export class Language {
    private constructor(private readonly props: PrismaLanguage) {}

    static fromPrisma(row: PrismaLanguage): Language {
        return new Language(row);
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

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): LanguageResponseDto {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
