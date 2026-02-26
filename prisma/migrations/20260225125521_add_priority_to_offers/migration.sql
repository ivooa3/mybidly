-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 999;

-- CreateIndex
CREATE INDEX "offers_priority_idx" ON "offers"("priority");
