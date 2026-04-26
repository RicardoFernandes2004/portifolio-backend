import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { LanguageRepository } from './infra/repositories/language.repository';
import { LanguagesController } from './presentation/languages.controller';
import { LanguagesService } from './service/languages.service';

@Module({
    imports: [AuthModule],
    controllers: [LanguagesController],
    providers: [PrismaService, LanguageRepository, LanguagesService],
    exports: [LanguagesService],
})
export class LanguagesModule {}
