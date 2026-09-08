-- AlterTable: colunas de tradução (EN). Todas nullable: nenhum dado existente muda.
ALTER TABLE "Post" ADD COLUMN "titleEn" TEXT,
                   ADD COLUMN "summaryEn" TEXT,
                   ADD COLUMN "contentEn" TEXT;

ALTER TABLE "Project" ADD COLUMN "titleEn" TEXT,
                      ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "Experience" ADD COLUMN "positionEn" TEXT,
                         ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "Education" ADD COLUMN "degreeEn" TEXT,
                        ADD COLUMN "fieldOfStudyEn" TEXT;

ALTER TABLE "Skill" ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "ResumeHeader" ADD COLUMN "jobTitleEn" TEXT,
                           ADD COLUMN "summaryEn" TEXT;

ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;

ALTER TABLE "Language" ADD COLUMN "nameEn" TEXT;
