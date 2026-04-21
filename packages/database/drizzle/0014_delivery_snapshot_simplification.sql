DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "Order"
		GROUP BY "deliveryInfoId"
		HAVING COUNT(*) > 1
	) THEN
		RAISE EXCEPTION 'Cannot simplify delivery snapshots: multiple orders currently share the same deliveryInfoId.';
	END IF;
END
$$;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "customerAddressId" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_customerAddressId_CustomerAddress_id_fk" FOREIGN KEY ("customerAddressId") REFERENCES "public"."CustomerAddress"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
UPDATE "DeliveryInfo" AS "delivery"
SET "notes" = "order_snapshot"."note"
FROM "Order" AS "order_snapshot"
WHERE "order_snapshot"."deliveryInfoId" = "delivery"."id"
  AND NULLIF(BTRIM(COALESCE("delivery"."notes", '')), '') IS NULL
  AND NULLIF(BTRIM(COALESCE("order_snapshot"."note", '')), '') IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "Order" DROP COLUMN "fulfillmentType";
--> statement-breakpoint
ALTER TABLE "Order" DROP COLUMN "note";
--> statement-breakpoint
CREATE UNIQUE INDEX "Order_deliveryInfoId_key" ON "Order" USING btree ("deliveryInfoId");
--> statement-breakpoint
DROP TYPE "public"."FulfillmentType";
