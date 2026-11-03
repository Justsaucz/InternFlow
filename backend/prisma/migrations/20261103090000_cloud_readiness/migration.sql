-- Additive reconciliation: retain old rows and accept an already-current db-push schema.
CREATE TABLE IF NOT EXISTS "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "University_domain_key" ON "University"("domain");
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "universityId" TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "universityId" TEXT;
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='User_universityId_fkey' AND conrelid='"User"'::regclass) THEN
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"(id) ON DELETE SET NULL ON UPDATE CASCADE;
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='StudentProfile_universityId_fkey' AND conrelid='"StudentProfile"'::regclass) THEN
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"(id) ON DELETE RESTRICT ON UPDATE CASCADE;
END IF;
END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING_REVIEW', 'COMPANY_EVALUATED', 'GRADED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'INTERVIEW_SCHEDULED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'COMMITTED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'CANCEL_REQUESTED';
ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN IF NOT EXISTS "applicationLink" TEXT,
ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
ADD COLUMN IF NOT EXISTS "contactLine" TEXT,
ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
ADD COLUMN IF NOT EXISTS "workingHours" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "university" TEXT DEFAULT '',
ALTER COLUMN "universityId" DROP NOT NULL,
ALTER COLUMN "studentId" SET DEFAULT '',
ALTER COLUMN "major" SET DEFAULT '',
ALTER COLUMN "faculty" SET DEFAULT '',
ALTER COLUMN "year" SET DEFAULT 1;

-- Preserve university labels without deleting historical university records.
UPDATE "StudentProfile" AS s SET "university" = u.name
FROM "University" AS u
WHERE s."universityId" = u.id AND COALESCE(s."university", '') = '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "UploadedFile" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "mimeType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WeeklyLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "applicationId" TEXT,
    "weekNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "workModality" TEXT NOT NULL DEFAULT 'ON_SITE',
    "supervisorName" TEXT,
    "plannedTasks" TEXT,
    "tasksDone" TEXT NOT NULL,
    "problemsAndSolutions" TEXT,
    "learnings" TEXT NOT NULL,
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "attachmentUrl" TEXT,
    "mentorApproved" BOOLEAN NOT NULL DEFAULT false,
    "mentorRating" INTEGER,
    "mentorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DailyLog" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "applicationId" TEXT,
    "logDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL DEFAULT 1,
    "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "workModality" TEXT NOT NULL DEFAULT 'ON_SITE',
    "supervisorName" TEXT,
    "tasksDone" TEXT NOT NULL,
    "problemsAndSolutions" TEXT,
    "learnings" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isBackdated" BOOLEAN NOT NULL DEFAULT false,
    "mentorApproved" BOOLEAN NOT NULL DEFAULT false,
    "mentorRating" INTEGER,
    "mentorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InternshipEvaluation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "applicationId" TEXT,
    "workQualityScore" INTEGER NOT NULL DEFAULT 5,
    "punctualityScore" INTEGER NOT NULL DEFAULT 5,
    "teamworkScore" INTEGER NOT NULL DEFAULT 5,
    "feedback" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'COMPANY_EVALUATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UploadedFile_key_key" ON "UploadedFile"("key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UploadedFile_fileUrl_key" ON "UploadedFile"("fileUrl");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DailyLog_studentId_logDate_key" ON "DailyLog"("studentId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InternshipEvaluation_applicationId_key" ON "InternshipEvaluation"("applicationId");

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UploadedFile_ownerId_fkey' AND conrelid = '"UploadedFile"'::regclass) THEN ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyLog_studentId_fkey' AND conrelid = '"WeeklyLog"'::regclass) THEN ALTER TABLE "WeeklyLog" ADD CONSTRAINT "WeeklyLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyLog_applicationId_fkey' AND conrelid = '"WeeklyLog"'::regclass) THEN ALTER TABLE "WeeklyLog" ADD CONSTRAINT "WeeklyLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyLog_studentId_fkey' AND conrelid = '"DailyLog"'::regclass) THEN ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyLog_applicationId_fkey' AND conrelid = '"DailyLog"'::regclass) THEN ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InternshipEvaluation_studentId_fkey' AND conrelid = '"InternshipEvaluation"'::regclass) THEN ALTER TABLE "InternshipEvaluation" ADD CONSTRAINT "InternshipEvaluation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InternshipEvaluation_companyId_fkey' AND conrelid = '"InternshipEvaluation"'::regclass) THEN ALTER TABLE "InternshipEvaluation" ADD CONSTRAINT "InternshipEvaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

-- AddForeignKey
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InternshipEvaluation_applicationId_fkey' AND conrelid = '"InternshipEvaluation"'::regclass) THEN ALTER TABLE "InternshipEvaluation" ADD CONSTRAINT "InternshipEvaluation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;
