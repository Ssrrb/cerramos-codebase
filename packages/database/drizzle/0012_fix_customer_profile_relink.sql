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
			"email" = CASE
				WHEN "CustomerProfile"."email" = OLD."email" THEN NULL
				ELSE "CustomerProfile"."email"
			END,
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

		IF EXISTS (
			SELECT 1
			FROM "CustomerProfile"
			WHERE "id" = NEW."customerId"
		) THEN
			UPDATE "CustomerProfile"
			SET
				"userId" = NEW."id",
				"email" = NEW."email",
				"name" = COALESCE(NEW."name", "CustomerProfile"."name"),
				"image" = COALESCE(NEW."image", "CustomerProfile"."image"),
				"updatedAt" = now()
			WHERE "id" = NEW."customerId";
		ELSE
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
			);
		END IF;
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
