ALTER TABLE "Product" ALTER COLUMN "primaryImageId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" DROP COLUMN "imageUrl";--> statement-breakpoint
ALTER TABLE "ProductLink" DROP COLUMN "imageUrl";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "Product" DROP COLUMN "image";
