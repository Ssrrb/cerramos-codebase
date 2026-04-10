ALTER TABLE "Product" ADD COLUMN "primaryImageId" text;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD COLUMN "imageObjectKey" text;--> statement-breakpoint
CREATE TABLE "ProductImage" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"objectKey" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"altText" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "ProductImage_productId_position_key" ON "ProductImage" USING btree ("productId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "ProductImage_id_productId_key" ON "ProductImage" USING btree ("id","productId");--> statement-breakpoint
CREATE INDEX "Product_primaryImageId_idx" ON "Product" USING btree ("primaryImageId");--> statement-breakpoint

CREATE OR REPLACE FUNCTION normalize_product_image_reference(input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  normalized text;
BEGIN
  IF input IS NULL OR btrim(input) = '' THEN
    RETURN NULL;
  END IF;

  normalized := btrim(input);
  normalized := replace(normalized, '%2F', '/');
  normalized := replace(normalized, '%2f', '/');
  normalized := replace(normalized, '%3A', ':');
  normalized := replace(normalized, '%3a', ':');
  normalized := replace(normalized, '%3D', '=');
  normalized := replace(normalized, '%3d', '=');
  normalized := replace(normalized, '%26', '&');
  normalized := replace(normalized, '%26', '&');

  IF position('objectKey=' IN normalized) > 0 THEN
    normalized := split_part(split_part(normalized, 'objectKey=', 2), '&', 1);
  END IF;

  IF normalized ~ '^https?://storage.googleapis.com/[^/]+/products/' THEN
    RETURN substring(normalized FROM 'https?://storage.googleapis.com/[^/]+/(products/[^?]+)');
  END IF;

  IF normalized ~ '^gs://[^/]+/products/' THEN
    RETURN substring(normalized FROM 'gs://[^/]+/(products/.*)$');
  END IF;

  IF normalized ~ '^[^/]+/products/' THEN
    RETURN substring(normalized FROM '^[^/]+/(products/.*)$');
  END IF;

  IF normalized !~ '^products/' AND normalized ~ 'products/' THEN
    normalized := substring(normalized FROM '(products/.*)$');
  END IF;

  IF normalized LIKE 'products/%' THEN
    RETURN split_part(normalized, '?', 1);
  END IF;

  RETURN NULL;
END
$$;--> statement-breakpoint

WITH resolved_product_images AS (
  SELECT
    "Product"."id" AS product_id,
    normalize_product_image_reference(
      COALESCE(
        NULLIF("Product"."image", ''),
        NULLIF("Product"."images" ->> 'primary', ''),
        "ProductLink"."imageUrl"
      )
    ) AS object_key
  FROM "Product"
  LEFT JOIN "ProductLink"
    ON "ProductLink"."productId" = "Product"."id"
)
INSERT INTO "ProductImage" (
  "id",
  "productId",
  "objectKey",
  "position",
  "altText",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('pimg_', substr(md5(product_id || ':' || object_key), 1, 24)),
  product_id,
  object_key,
  0,
  NULL,
  now(),
  now()
FROM resolved_product_images
WHERE object_key IS NOT NULL
ON CONFLICT ("productId", "position") DO NOTHING;--> statement-breakpoint

UPDATE "Product"
SET "primaryImageId" = "ProductImage"."id"
FROM "ProductImage"
WHERE "ProductImage"."productId" = "Product"."id"
  AND "ProductImage"."position" = 0;--> statement-breakpoint

WITH resolved_order_images AS (
  SELECT
    "OrderItem"."id" AS order_item_id,
    normalize_product_image_reference(
      COALESCE(
        NULLIF("OrderItem"."imageUrl", ''),
        "ProductLink"."imageUrl",
        NULLIF("Product"."image", ''),
        NULLIF("Product"."images" ->> 'primary', '')
      )
    ) AS object_key
  FROM "OrderItem"
  LEFT JOIN "ProductLink"
    ON "ProductLink"."id" = "OrderItem"."productLinkId"
  LEFT JOIN "Product"
    ON "Product"."id" = "OrderItem"."productId"
)
UPDATE "OrderItem"
SET "imageObjectKey" = resolved_order_images.object_key
FROM resolved_order_images
WHERE resolved_order_images.order_item_id = "OrderItem"."id"
  AND resolved_order_images.object_key IS NOT NULL;--> statement-breakpoint

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_primaryImageId_id_ProductImage_id_productId_fk"
  FOREIGN KEY ("primaryImageId", "id")
  REFERENCES "public"."ProductImage"("id", "productId")
  ON DELETE restrict
  ON UPDATE no action
  DEFERRABLE INITIALLY DEFERRED;--> statement-breakpoint

DROP FUNCTION normalize_product_image_reference(text);
