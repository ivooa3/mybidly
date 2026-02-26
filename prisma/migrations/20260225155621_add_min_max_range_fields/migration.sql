-- AlterTable: Drop range column and add min_range, max_range columns
ALTER TABLE "offers" DROP COLUMN IF EXISTS "range";
ALTER TABLE "offers" ADD COLUMN "min_range" INTEGER NOT NULL DEFAULT -10;
ALTER TABLE "offers" ADD COLUMN "max_range" INTEGER NOT NULL DEFAULT 25;
