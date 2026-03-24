CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "AppUserRole" DEFAULT 'buyer' NOT NULL,
	"commerceId" text,
	"customerId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_customerId_Customer_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "user" USING btree ("email");
--> statement-breakpoint
CREATE INDEX "user_commerceId_idx" ON "user" USING btree ("commerceId");
--> statement-breakpoint
CREATE INDEX "user_customerId_idx" ON "user" USING btree ("customerId");
--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_key" ON "session" USING btree ("token");
--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");
--> statement-breakpoint
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account" USING btree ("providerId","accountId");
--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");
--> statement-breakpoint
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification" USING btree ("identifier","value");
--> statement-breakpoint
INSERT INTO "user" (
	"id",
	"name",
	"email",
	"emailVerified",
	"image",
	"role",
	"commerceId",
	"customerId",
	"createdAt",
	"updatedAt"
)
SELECT
	"AppUser"."id",
	COALESCE("AppUser"."name", split_part("AppUser"."email", '@', 1)),
	"AppUser"."email",
	false,
	NULL,
	"AppUser"."role",
	"AppUser"."commerceId",
	"AppUser"."customerId",
	"AppUser"."createdAt",
	"AppUser"."updatedAt"
FROM "AppUser"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
INSERT INTO "account" (
	"id",
	"userId",
	"accountId",
	"providerId",
	"createdAt",
	"updatedAt"
)
SELECT
	"OAuthAccount"."id",
	"OAuthAccount"."userId",
	"OAuthAccount"."providerAccountId",
	"OAuthAccount"."provider"::text,
	now(),
	now()
FROM "OAuthAccount"
INNER JOIN "user" ON "user"."id" = "OAuthAccount"."userId"
ON CONFLICT ("providerId", "accountId") DO NOTHING;
--> statement-breakpoint
DROP TABLE "AuthSession";
--> statement-breakpoint
DROP TABLE "OAuthAccount";
--> statement-breakpoint
DROP TABLE "AppUser";
