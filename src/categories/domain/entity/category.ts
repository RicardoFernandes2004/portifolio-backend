import type { Category as PrismaCategory } from 'src/generated/prisma/client';
import { CategoryResponseDto } from 'src/categories/service/dtos/category.dto';

export class Category {
    private constructor(private readonly props: PrismaCategory) {}

    static fromPrisma(row: PrismaCategory): Category {
        return new Category(row);
    }

    get id(): number {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    toResponseDto(): CategoryResponseDto {
        const dto = new CategoryResponseDto();
        dto.id = this.id;
        dto.name = this.name;
        dto.createdAt = this.createdAt;
        dto.updatedAt = this.updatedAt;
        return dto;
    }
}
