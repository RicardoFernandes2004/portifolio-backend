import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { SkillRepository } from './infra/repositories/skill.repository';
import { SkillsController } from './presentation/skills.controller';
import { SkillsService } from './service/skills.service';

@Module({
    imports: [AuthModule],
    controllers: [SkillsController],
    providers: [PrismaService, SkillRepository, SkillsService],
    exports: [SkillsService],
})
export class SkillsModule {}
