-- AlterTable
ALTER TABLE "AboutContent" ADD COLUMN     "skills" JSONB;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
