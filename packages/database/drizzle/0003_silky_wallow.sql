CREATE TABLE "Product" (
	"id" text PRIMARY KEY NOT NULL,
	"commerceId" text NOT NULL,
	"name" text NOT NULL,
	"shortDescription" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"unitPrice" integer NOT NULL,
	"currency" text DEFAULT 'PYG' NOT NULL,
	"sizes" text[] NOT NULL,
	"colors" text[] NOT NULL,
	"images" jsonb NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_commerceId_Commerce_id_fk" FOREIGN KEY ("commerceId") REFERENCES "public"."Commerce"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Product_commerceId_idx" ON "Product" USING btree ("commerceId");