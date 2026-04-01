DO $$
BEGIN
	IF to_regclass('public."ProductLink"') IS NULL THEN
		RAISE EXCEPTION
			'Expected public."ProductLink" before applying 0006_thin_gabe_jones. Current database is drifted; reset or repair it before continuing.';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'ProductLink'
			AND column_name = 'productId'
	) THEN
		RAISE EXCEPTION
			'Expected ProductLink.productId before applying 0006_thin_gabe_jones. Current database is drifted; reset or repair it before continuing.';
	END IF;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ProductLink_productId_key" ON "ProductLink" USING btree ("productId");
