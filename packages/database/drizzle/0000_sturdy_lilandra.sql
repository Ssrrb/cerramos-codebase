CREATE TYPE "public"."AppUserRole" AS ENUM('buyer', 'merchant_admin', 'operator');--> statement-breakpoint
CREATE TYPE "public"."CommerceTrustState" AS ENUM('pending_review', 'verified', 'limited', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."CustomerIdentityProvider" AS ENUM('password', 'google');--> statement-breakpoint
CREATE TYPE "public"."DeliveryMode" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."FulfillmentType" AS ENUM('delivery', 'pickup');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('new', 'pending_payment', 'paid', 'confirmed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethodType" AS ENUM('in_store', 'cash_on_delivery', 'upay_card', 'upay_bank_transfer', 'other');--> statement-breakpoint
CREATE TYPE "public"."PaymentProviderName" AS ENUM('pagopar_upay', 'manual');--> statement-breakpoint
CREATE TYPE "public"."PaymentRiskState" AS ENUM('pending', 'held', 'release_ready', 'reverse_pending', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('not_required', 'pending', 'authorized', 'paid', 'failed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ProductLinkStatus" AS ENUM('draft', 'active', 'inactive', 'expired');--> statement-breakpoint
CREATE TABLE "AppUser" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "AppUserRole" DEFAULT 'buyer' NOT NULL,
	"commerceId" text,
	"customerId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AuthSession" (
	"id" text PRIMARY KEY NOT NULL,
	"tokenHash" text NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "Commerce" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"legalName" text,
	"trustState" "CommerceTrustState" DEFAULT 'pending_review' NOT NULL,
	"trustScore" integer DEFAULT 0 NOT NULL,
	"defaultOrderExpiryHours" integer DEFAULT 24 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Customer" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"phone" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CustomerConsent" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"type" text NOT NULL,
	"granted" boolean DEFAULT false NOT NULL,
	"grantedAt" timestamp (3),
	"revokedAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CustomerIdentity" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"provider" "CustomerIdentityProvider" NOT NULL,
	"providerSubject" text NOT NULL,
	"passwordHash" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DeliveryInfo" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text,
	"mode" "DeliveryMode" NOT NULL,
	"recipientName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"addressLine1" text,
	"addressLine2" text,
	"city" text,
	"reference" text,
	"notes" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OAuthAccount" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" "CustomerIdentityProvider" NOT NULL,
	"providerAccountId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" text PRIMARY KEY NOT NULL,
	"commerceId" text NOT NULL,
	"productLinkId" text NOT NULL,
	"customerId" text NOT NULL,
	"deliveryInfoId" text NOT NULL,
	"orderStatus" "OrderStatus" DEFAULT 'new' NOT NULL,
	"paymentStatus" "PaymentStatus" DEFAULT 'not_required' NOT NULL,
	"fulfillmentType" "FulfillmentType" NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"note" text,
	"subtotal" integer NOT NULL,
	"total" integer NOT NULL,
	"currency" text DEFAULT 'PYG' NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"confirmedAt" timestamp (3),
	"cancelledAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderItem" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productLinkId" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" integer NOT NULL,
	"totalPrice" integer NOT NULL,
	"variantLabel" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OrderStatusHistory" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"fromStatus" "OrderStatus",
	"toStatus" "OrderStatus" NOT NULL,
	"changedByType" text,
	"changedById" text,
	"reason" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Page" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"paymentIntentId" text,
	"provider" "PaymentProviderName" NOT NULL,
	"externalEventId" text,
	"eventType" text NOT NULL,
	"payload" jsonb NOT NULL,
	"receivedAt" timestamp (3) DEFAULT now() NOT NULL,
	"processedAt" timestamp (3),
	"processingResult" text
);
--> statement-breakpoint
CREATE TABLE "PaymentIntent" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"provider" "PaymentProviderName" DEFAULT 'pagopar_upay' NOT NULL,
	"method" "PaymentMethodType",
	"externalReference" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'PYG' NOT NULL,
	"status" "PaymentStatus" DEFAULT 'pending' NOT NULL,
	"riskState" "PaymentRiskState" DEFAULT 'pending' NOT NULL,
	"fundsReleased" boolean DEFAULT false NOT NULL,
	"providerMetadata" jsonb,
	"expiresAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductLink" (
	"id" text PRIMARY KEY NOT NULL,
	"commerceId" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"imageUrl" text,
	"currency" text DEFAULT 'PYG' NOT NULL,
	"unitPrice" integer NOT NULL,
	"status" "ProductLinkStatus" DEFAULT 'draft' NOT NULL,
	"paymentRequired" boolean DEFAULT false NOT NULL,
	"pickupEnabled" boolean DEFAULT true NOT NULL,
	"deliveryEnabled" boolean DEFAULT true NOT NULL,
	"expiresAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProductVariantOption" (
	"id" text PRIMARY KEY NOT NULL,
	"productLinkId" text NOT NULL,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"additionalPrice" integer DEFAULT 0 NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_AppUser_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."AppUser"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CustomerConsent" ADD CONSTRAINT "CustomerConsent_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CustomerIdentity" ADD CONSTRAINT "CustomerIdentity_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_AppUser_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."AppUser"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_productLinkId_ProductLink_id_fk" FOREIGN KEY ("productLinkId") REFERENCES "public"."ProductLink"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryInfoId_DeliveryInfo_id_fk" FOREIGN KEY ("deliveryInfoId") REFERENCES "public"."DeliveryInfo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productLinkId_ProductLink_id_fk" FOREIGN KEY ("productLinkId") REFERENCES "public"."ProductLink"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentIntentId_PaymentIntent_id_fk" FOREIGN KEY ("paymentIntentId") REFERENCES "public"."PaymentIntent"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductLink" ADD CONSTRAINT "ProductLink_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_productLinkId_ProductLink_id_fk" FOREIGN KEY ("productLinkId") REFERENCES "public"."ProductLink"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser" USING btree ("email");--> statement-breakpoint
CREATE INDEX "AppUser_commerceId_idx" ON "AppUser" USING btree ("commerceId");--> statement-breakpoint
CREATE INDEX "AppUser_customerId_idx" ON "AppUser" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession" USING btree ("tokenHash");--> statement-breakpoint
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "Commerce_slug_key" ON "Commerce" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer" USING btree ("email");--> statement-breakpoint
CREATE INDEX "CustomerConsent_customerId_idx" ON "CustomerConsent" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "CustomerIdentity_customerId_idx" ON "CustomerIdentity" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "CustomerIdentity_provider_providerSubject_key" ON "CustomerIdentity" USING btree ("provider","providerSubject");--> statement-breakpoint
CREATE INDEX "DeliveryInfo_customerId_idx" ON "DeliveryInfo" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON "OAuthAccount" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "Order_commerceId_idx" ON "Order" USING btree ("commerceId");--> statement-breakpoint
CREATE INDEX "Order_productLinkId_idx" ON "Order" USING btree ("productLinkId");--> statement-breakpoint
CREATE INDEX "Order_customerId_idx" ON "Order" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "Order_deliveryInfoId_idx" ON "Order" USING btree ("deliveryInfoId");--> statement-breakpoint
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "OrderItem_productLinkId_idx" ON "OrderItem" USING btree ("productLinkId");--> statement-breakpoint
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "Page_name_idx" ON "Page" USING btree ("name");--> statement-breakpoint
CREATE INDEX "PaymentEvent_paymentIntentId_idx" ON "PaymentEvent" USING btree ("paymentIntentId");--> statement-breakpoint
CREATE UNIQUE INDEX "PaymentEvent_provider_externalEventId_key" ON "PaymentEvent" USING btree ("provider","externalEventId");--> statement-breakpoint
CREATE INDEX "PaymentIntent_orderId_idx" ON "PaymentIntent" USING btree ("orderId");--> statement-breakpoint
CREATE UNIQUE INDEX "ProductLink_slug_key" ON "ProductLink" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ProductLink_commerceId_idx" ON "ProductLink" USING btree ("commerceId");--> statement-breakpoint
CREATE INDEX "ProductVariantOption_productLinkId_idx" ON "ProductVariantOption" USING btree ("productLinkId");