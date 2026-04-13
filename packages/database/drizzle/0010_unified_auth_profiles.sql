DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM (
			SELECT "commerceId"
			FROM "user"
			WHERE "commerceId" IS NOT NULL
			GROUP BY "commerceId"
			HAVING count(*) > 1
		) duplicated_commerce_links
	) THEN
		RAISE EXCEPTION 'Cannot backfill MerchantProfile: multiple users reference the same commerceId.';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM (
			SELECT "customerId"
			FROM "user"
			WHERE "customerId" IS NOT NULL
			GROUP BY "customerId"
			HAVING count(*) > 1
		) duplicated_customer_links
	) THEN
		RAISE EXCEPTION 'Cannot backfill CustomerProfile.userId: multiple users reference the same customerId.';
	END IF;
END
$$;
--> statement-breakpoint
CREATE TYPE "public"."MerchantProfileRole" AS ENUM('owner');
--> statement-breakpoint
ALTER TABLE "Customer" RENAME TO "CustomerProfile";
--> statement-breakpoint
ALTER INDEX "Customer_email_key" RENAME TO "CustomerProfile_email_key";
--> statement-breakpoint
ALTER TABLE "CustomerProfile" ADD COLUMN "userId" text;
--> statement-breakpoint
ALTER TABLE "CustomerProfile" ADD COLUMN "image" text;
--> statement-breakpoint
ALTER TABLE "CustomerConsent" RENAME CONSTRAINT "CustomerConsent_customerId_Customer_id_fk" TO "CustomerConsent_customerId_CustomerProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "CustomerIdentity" RENAME CONSTRAINT "CustomerIdentity_customerId_Customer_id_fk" TO "CustomerIdentity_customerId_CustomerProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" RENAME CONSTRAINT "DeliveryInfo_customerId_Customer_id_fk" TO "DeliveryInfo_customerId_CustomerProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "Order" RENAME CONSTRAINT "Order_customerId_Customer_id_fk" TO "Order_customerId_CustomerProfile_id_fk";
--> statement-breakpoint
ALTER TABLE "user" RENAME CONSTRAINT "user_customerId_Customer_id_fk" TO "user_customerId_CustomerProfile_id_fk";
--> statement-breakpoint
CREATE TABLE "MerchantProfile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"commerceId" text NOT NULL,
	"role" "MerchantProfileRole" DEFAULT 'owner' NOT NULL,
	"phone" text,
	"legalFullName" text,
	"dateOfBirth" timestamp (3),
	"nationality" text,
	"governmentId" text,
	"residentialAddress" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "MerchantProfile" ADD CONSTRAINT "MerchantProfile_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "MerchantProfile" ADD CONSTRAINT "MerchantProfile_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "CustomerProfile_userId_idx" ON "CustomerProfile" USING btree ("userId");
--> statement-breakpoint
CREATE UNIQUE INDEX "MerchantProfile_userId_key" ON "MerchantProfile" USING btree ("userId");
--> statement-breakpoint
CREATE UNIQUE INDEX "MerchantProfile_commerceId_key" ON "MerchantProfile" USING btree ("commerceId");
--> statement-breakpoint
CREATE INDEX "MerchantProfile_userId_idx" ON "MerchantProfile" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "MerchantProfile_commerceId_idx" ON "MerchantProfile" USING btree ("commerceId");
--> statement-breakpoint
UPDATE "CustomerProfile" AS "customerProfile"
SET
	"userId" = "user"."id",
	"image" = COALESCE("customerProfile"."image", "user"."image"),
	"updatedAt" = now()
FROM "user"
WHERE "user"."customerId" = "customerProfile"."id";
--> statement-breakpoint
INSERT INTO "MerchantProfile" (
	"id",
	"userId",
	"commerceId",
	"role",
	"phone",
	"legalFullName",
	"createdAt",
	"updatedAt"
)
SELECT
	concat(
		'merchant_profile_',
		substr(md5(random()::text || clock_timestamp()::text || "user"."id"), 1, 24)
	),
	"user"."id",
	"user"."commerceId",
	'owner'::"MerchantProfileRole",
	"customerProfile"."phone",
	"user"."name",
	COALESCE("user"."createdAt", now()),
	now()
FROM "user"
LEFT JOIN "CustomerProfile" AS "customerProfile" ON "customerProfile"."id" = "user"."customerId"
WHERE "user"."commerceId" IS NOT NULL;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION sync_user_profile_mirrors()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'UPDATE'
		AND OLD."customerId" IS DISTINCT FROM NEW."customerId"
		AND OLD."customerId" IS NOT NULL THEN
		UPDATE "CustomerProfile"
		SET
			"userId" = NULL,
			"updatedAt" = now()
		WHERE "id" = OLD."customerId"
			AND "userId" = OLD."id";
	END IF;

	IF NEW."customerId" IS NOT NULL THEN
		IF EXISTS (
			SELECT 1
			FROM "CustomerProfile"
			WHERE "id" = NEW."customerId"
				AND "userId" IS NOT NULL
				AND "userId" <> NEW."id"
		) THEN
			RAISE EXCEPTION 'CustomerProfile % is already linked to another user.', NEW."customerId";
		END IF;

		INSERT INTO "CustomerProfile" (
			"id",
			"userId",
			"email",
			"name",
			"image",
			"createdAt",
			"updatedAt"
		)
		VALUES (
			NEW."customerId",
			NEW."id",
			NEW."email",
			NEW."name",
			NEW."image",
			now(),
			now()
		)
		ON CONFLICT ("id") DO UPDATE
		SET
			"userId" = EXCLUDED."userId",
			"email" = EXCLUDED."email",
			"name" = COALESCE(EXCLUDED."name", "CustomerProfile"."name"),
			"image" = COALESCE(EXCLUDED."image", "CustomerProfile"."image"),
			"updatedAt" = now();
	END IF;

	IF NEW."commerceId" IS NULL THEN
		DELETE FROM "MerchantProfile"
		WHERE "userId" = NEW."id";
	ELSE
		IF TG_OP = 'UPDATE' AND OLD."commerceId" IS DISTINCT FROM NEW."commerceId" THEN
			DELETE FROM "MerchantProfile"
			WHERE "userId" = NEW."id";
		END IF;

		INSERT INTO "MerchantProfile" (
			"id",
			"userId",
			"commerceId",
			"role",
			"legalFullName",
			"createdAt",
			"updatedAt"
		)
		VALUES (
			concat(
				'merchant_profile_',
				substr(md5(random()::text || clock_timestamp()::text || NEW."id"), 1, 24)
			),
			NEW."id",
			NEW."commerceId",
			'owner'::"MerchantProfileRole",
			NEW."name",
			now(),
			now()
		)
		ON CONFLICT ("userId") DO UPDATE
		SET
			"commerceId" = EXCLUDED."commerceId",
			"role" = EXCLUDED."role",
			"legalFullName" = COALESCE(
				EXCLUDED."legalFullName",
				"MerchantProfile"."legalFullName"
			),
			"updatedAt" = now();
	END IF;

	RETURN NEW;
END
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "user_sync_profile_mirrors" ON "user";
--> statement-breakpoint
CREATE TRIGGER "user_sync_profile_mirrors"
AFTER INSERT OR UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION sync_user_profile_mirrors();
