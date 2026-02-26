-- AlterTable: Add range column and remove max_price
ALTER TABLE "offers" ADD COLUMN "range" INTEGER NOT NULL DEFAULT 20;

-- Drop the max_price column
ALTER TABLE "offers" DROP COLUMN "max_price";
