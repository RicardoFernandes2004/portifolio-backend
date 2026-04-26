import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { EducationsModule } from './educations/educations.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { LanguagesModule } from './languages/languages.module';
import { PostsModule } from './posts/posts.module';
import { ProjectsModule } from './projects/projects.module';
import { ResumeModule } from './resume/resume.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ExperiencesModule,
        EducationsModule,
        SkillsModule,
        LanguagesModule,
        ProjectsModule,
        ResumeModule,
        CategoriesModule,
        PostsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
