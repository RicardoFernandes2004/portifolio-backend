import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { EducationRepository } from './infra/repositories/education.repository';
import { EducationsController } from './presentation/educations.controller';
import { EducationsService } from './service/educations.service';

@Module({
    imports: [AuthModule],
    controllers: [EducationsController],
    providers: [PrismaService, EducationRepository, EducationsService],
    exports: [EducationsService],
})
export class EducationsModule {}
