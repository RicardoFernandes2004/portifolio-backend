import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
    @ApiProperty({
        example: true,
        description: 'Estado atual do like para este visitante (por IP)',
    })
    liked!: boolean;

    @ApiProperty({ example: 42, description: 'Total de likes do post' })
    likeCount!: number;
}

export class ViewResponseDto {
    @ApiProperty({ example: 1234, description: 'Total de views únicas do post' })
    viewCount!: number;
}
