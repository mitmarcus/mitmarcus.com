-- AlterTable
ALTER TABLE "Post" ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("slug");

-- DropIndex
DROP INDEX "Post_slug_key";

