DROP INDEX "ProductLink_slug_key";--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN "productId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN "imageUrl" text;--> statement-breakpoint
ALTER TABLE "ProductLink" ADD COLUMN "productId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductLink" ADD CONSTRAINT "ProductLink_productId_commerceId_Product_id_commerceId_fk" FOREIGN KEY ("productId","commerceId") REFERENCES "public"."Product"("id","commerceId") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "Product_id_commerceId_key" ON "Product" USING btree ("id","commerceId");--> statement-breakpoint
CREATE UNIQUE INDEX "ProductLink_commerceId_slug_key" ON "ProductLink" USING btree ("commerceId","slug");--> statement-breakpoint
CREATE INDEX "ProductLink_productId_idx" ON "ProductLink" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "ProductLink_commerceId_slug_status_idx" ON "ProductLink" USING btree ("commerceId","slug","status");