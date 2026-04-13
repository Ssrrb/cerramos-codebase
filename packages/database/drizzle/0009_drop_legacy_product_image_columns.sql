ALTER TABLE "Product" ALTER COLUMN "primaryImageId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" DROP COLUMN IF EXISTS "imageUrl";--> statement-breakpoint
ALTER TABLE "ProductLink" DROP COLUMN IF EXISTS "imageUrl";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN IF EXISTS "images";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN IF EXISTS "image";
