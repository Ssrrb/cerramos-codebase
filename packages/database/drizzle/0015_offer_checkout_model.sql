ALTER TYPE "public"."DeliveryMode" RENAME TO "DeliveryMode__old";
--> statement-breakpoint
CREATE TYPE "public"."BillingMode" AS ENUM('one_time', 'subscription');
--> statement-breakpoint
CREATE TYPE "public"."DeliveryMode" AS ENUM('none', 'delivery', 'pickup');
--> statement-breakpoint
CREATE TYPE "public"."FulfillmentMode" AS ENUM('none', 'delivery', 'pickup', 'delivery_or_pickup');
--> statement-breakpoint
CREATE TYPE "public"."ProductKind" AS ENUM('product', 'service');
--> statement-breakpoint
CREATE TYPE "public"."SubscriptionCadence" AS ENUM('monthly');
--> statement-breakpoint
ALTER TABLE "DeliveryInfo"
  ALTER COLUMN "mode" TYPE "public"."DeliveryMode"
  USING (
    CASE
      WHEN "mode"::text = 'delivery' THEN 'delivery'
      WHEN "mode"::text = 'pickup' THEN 'pickup'
      ELSE 'none'
    END
  )::"public"."DeliveryMode";
--> statement-breakpoint
DROP TYPE "public"."DeliveryMode__old";
--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "kind" "public"."ProductKind" DEFAULT 'product' NOT NULL;
--> statement-breakpoint
ALTER TABLE "ProductLink" ADD COLUMN "billingMode" "public"."BillingMode" DEFAULT 'one_time' NOT NULL;
--> statement-breakpoint
ALTER TABLE "ProductLink" ADD COLUMN "fulfillmentMode" "public"."FulfillmentMode" DEFAULT 'delivery_or_pickup' NOT NULL;
--> statement-breakpoint
ALTER TABLE "ProductLink" ADD COLUMN "subscriptionCadence" "public"."SubscriptionCadence";
--> statement-breakpoint
UPDATE "ProductLink"
SET "fulfillmentMode" = CASE
  WHEN "deliveryEnabled" = true AND "pickupEnabled" = true THEN 'delivery_or_pickup'::"public"."FulfillmentMode"
  WHEN "deliveryEnabled" = true THEN 'delivery'::"public"."FulfillmentMode"
  WHEN "pickupEnabled" = true THEN 'pickup'::"public"."FulfillmentMode"
  ELSE 'none'::"public"."FulfillmentMode"
END;
--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "productKind" "public"."ProductKind" DEFAULT 'product' NOT NULL;
--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "billingMode" "public"."BillingMode" DEFAULT 'one_time' NOT NULL;
--> statement-breakpoint
ALTER TABLE "Order" ADD COLUMN "fulfillmentMode" "public"."FulfillmentMode" DEFAULT 'delivery_or_pickup' NOT NULL;
--> statement-breakpoint
UPDATE "Order" AS "order_snapshot"
SET
  "productKind" = COALESCE("product_record"."kind", 'product'::"public"."ProductKind"),
  "billingMode" = COALESCE("link_record"."billingMode", 'one_time'::"public"."BillingMode"),
  "fulfillmentMode" = COALESCE("link_record"."fulfillmentMode", 'delivery_or_pickup'::"public"."FulfillmentMode")
FROM "ProductLink" AS "link_record"
INNER JOIN "Product" AS "product_record" ON "product_record"."id" = "link_record"."productId"
WHERE "order_snapshot"."productLinkId" = "link_record"."id";
--> statement-breakpoint
CREATE TABLE "PaymentCustomer" (
  "id" text PRIMARY KEY NOT NULL,
  "commerceId" text NOT NULL,
  "customerId" text NOT NULL,
  "provider" "public"."PaymentProviderName" DEFAULT 'pagopar_upay' NOT NULL,
  "externalCustomerId" text NOT NULL,
  "providerMetadata" jsonb,
  "createdAt" timestamp (3) DEFAULT now() NOT NULL,
  "updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SubscriptionAgreement" (
  "id" text PRIMARY KEY NOT NULL,
  "commerceId" text NOT NULL,
  "customerId" text NOT NULL,
  "productLinkId" text NOT NULL,
  "orderId" text NOT NULL,
  "paymentCustomerId" text,
  "provider" "public"."PaymentProviderName" DEFAULT 'pagopar_upay' NOT NULL,
  "cadence" "public"."SubscriptionCadence" DEFAULT 'monthly' NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'PYG' NOT NULL,
  "status" text DEFAULT 'pending_activation' NOT NULL,
  "externalAgreementId" text,
  "externalCustomerId" text,
  "activatedAt" timestamp (3),
  "cancelledAt" timestamp (3),
  "providerMetadata" jsonb,
  "createdAt" timestamp (3) DEFAULT now() NOT NULL,
  "updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "PaymentCustomer" ADD CONSTRAINT "PaymentCustomer_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "PaymentCustomer" ADD CONSTRAINT "PaymentCustomer_customerId_CustomerProfile_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."CustomerProfile"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "SubscriptionAgreement" ADD CONSTRAINT "SubscriptionAgreement_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "SubscriptionAgreement" ADD CONSTRAINT "SubscriptionAgreement_customerId_CustomerProfile_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."CustomerProfile"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "SubscriptionAgreement" ADD CONSTRAINT "SubscriptionAgreement_productLinkId_ProductLink_id_fk" FOREIGN KEY ("productLinkId") REFERENCES "public"."ProductLink"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "SubscriptionAgreement" ADD CONSTRAINT "SubscriptionAgreement_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "SubscriptionAgreement" ADD CONSTRAINT "SubscriptionAgreement_paymentCustomerId_PaymentCustomer_id_fk" FOREIGN KEY ("paymentCustomerId") REFERENCES "public"."PaymentCustomer"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "PaymentCustomer_commerceId_idx" ON "PaymentCustomer" USING btree ("commerceId");
--> statement-breakpoint
CREATE INDEX "PaymentCustomer_customerId_idx" ON "PaymentCustomer" USING btree ("customerId");
--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentCustomer_commerceId_customerId_provider_key" ON "PaymentCustomer" USING btree ("commerceId", "customerId", "provider");
--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentCustomer_provider_externalCustomerId_key" ON "PaymentCustomer" USING btree ("provider", "externalCustomerId");
--> statement-breakpoint
CREATE INDEX "SubscriptionAgreement_commerceId_idx" ON "SubscriptionAgreement" USING btree ("commerceId");
--> statement-breakpoint
CREATE INDEX "SubscriptionAgreement_customerId_idx" ON "SubscriptionAgreement" USING btree ("customerId");
--> statement-breakpoint
CREATE INDEX "SubscriptionAgreement_orderId_idx" ON "SubscriptionAgreement" USING btree ("orderId");
--> statement-breakpoint
CREATE INDEX "SubscriptionAgreement_productLinkId_idx" ON "SubscriptionAgreement" USING btree ("productLinkId");
--> statement-breakpoint
CREATE UNIQUE INDEX "SubscriptionAgreement_orderId_key" ON "SubscriptionAgreement" USING btree ("orderId");
