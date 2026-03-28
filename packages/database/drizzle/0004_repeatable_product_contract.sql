CREATE TYPE "public"."ProductStatus" AS ENUM('draft', 'active', 'inactive');--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "stock" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "deliveryIncluded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "image" text DEFAULT '';--> statement-breakpoint
UPDATE "Product"
SET
  "status" = 'draft',
  "stock" = 0,
  "deliveryIncluded" = false,
  "image" = COALESCE(
    (
      SELECT value
      FROM jsonb_each_text("Product"."images")
      LIMIT 1
    ),
    ''
  );--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "stock" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "deliveryIncluded" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "shortDescription";--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "unitPrice" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ALTER COLUMN "images" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "sizes";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "colors";--> statement-breakpoint

