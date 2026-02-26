-- AlterTable: Update offers schema
-- 1. Add new columns with defaults
ALTER TABLE "offers" ADD COLUMN "min_price" DECIMAL(10,2);
ALTER TABLE "offers" ADD COLUMN "max_price" DECIMAL(10,2);
ALTER TABLE "offers" ADD COLUMN "scope_of_delivery" TEXT;

-- 2. Migrate existing data (min_bid -> min_price, slider_max -> max_price)
UPDATE "offers" SET "min_price" = "min_bid", "max_price" = "slider_max";

-- 3. Make min_price and max_price required
ALTER TABLE "offers" ALTER COLUMN "min_price" SET NOT NULL;
ALTER TABLE "offers" ALTER COLUMN "max_price" SET NOT NULL;

-- 4. Make product_sku required (set empty string for null values first)
UPDATE "offers" SET "product_sku" = '' WHERE "product_sku" IS NULL;
ALTER TABLE "offers" ALTER COLUMN "product_sku" SET NOT NULL;

-- 5. Drop old columns
ALTER TABLE "offers" DROP COLUMN "wholesale_price";
ALTER TABLE "offers" DROP COLUMN "min_bid";
ALTER TABLE "offers" DROP COLUMN "slider_min";
ALTER TABLE "offers" DROP COLUMN "slider_max";
