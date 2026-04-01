DO $$
BEGIN
	IF to_regclass('public."ProductLink"') IS NULL THEN
		RAISE EXCEPTION
			'Expected public."ProductLink" from earlier migrations before applying 0005_complex_speedball. Current database is drifted; reset or repair it before continuing.';
	END IF;
END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "ProductLink_slug_key";--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productId" text;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "title" text;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "imageUrl" text;--> statement-breakpoint
ALTER TABLE "ProductLink" ADD COLUMN IF NOT EXISTS "productId" text;--> statement-breakpoint
UPDATE "ProductLink" AS "productLink"
SET "productId" = (
	SELECT "Product"."id"
	FROM "Product"
	WHERE "Product"."commerceId" = "productLink"."commerceId"
		AND "Product"."name" = "productLink"."title"
		AND "Product"."unitPrice" = "productLink"."unitPrice"
	ORDER BY "Product"."createdAt" ASC, "Product"."id" ASC
	LIMIT 1
)
WHERE "productLink"."productId" IS NULL;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "ProductLink"
		WHERE "productId" IS NULL
	) THEN
		RAISE EXCEPTION
			'Unable to backfill ProductLink.productId during 0005_complex_speedball. Reset the dev database or repair legacy ProductLink rows before retrying.';
	END IF;
END $$;--> statement-breakpoint
UPDATE "OrderItem" AS "orderItem"
SET
	"productId" = "productLink"."productId",
	"title" = COALESCE("orderItem"."title", "productLink"."title", "product"."name"),
	"description" = COALESCE("orderItem"."description", "productLink"."description", "product"."description"),
	"imageUrl" = COALESCE("orderItem"."imageUrl", "productLink"."imageUrl", "product"."image")
FROM "ProductLink" AS "productLink"
LEFT JOIN "Product" AS "product"
	ON "product"."id" = "productLink"."productId"
WHERE "productLink"."id" = "orderItem"."productLinkId";--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "OrderItem"
		WHERE "productId" IS NULL OR "title" IS NULL
	) THEN
		RAISE EXCEPTION
			'Unable to backfill OrderItem.productId/title during 0005_complex_speedball. Reset the dev database or repair legacy OrderItem rows before retrying.';
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "OrderItem" ALTER COLUMN "productId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "OrderItem" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ProductLink" ALTER COLUMN "productId" SET NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'OrderItem_productId_Product_id_fk'
	) THEN
		ALTER TABLE "OrderItem"
			ADD CONSTRAINT "OrderItem_productId_Product_id_fk"
			FOREIGN KEY ("productId")
			REFERENCES "public"."Product"("id")
			ON DELETE restrict
			ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "Product_id_commerceId_key" ON "Product" USING btree ("id","commerceId");--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'ProductLink_productId_commerceId_Product_id_commerceId_fk'
	) THEN
		ALTER TABLE "ProductLink"
			ADD CONSTRAINT "ProductLink_productId_commerceId_Product_id_commerceId_fk"
			FOREIGN KEY ("productId","commerceId")
			REFERENCES "public"."Product"("id","commerceId")
			ON DELETE restrict
			ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProductLink_commerceId_slug_key" ON "ProductLink" USING btree ("commerceId","slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProductLink_productId_idx" ON "ProductLink" USING btree ("productId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ProductLink_commerceId_slug_status_idx" ON "ProductLink" USING btree ("commerceId","slug","status");
