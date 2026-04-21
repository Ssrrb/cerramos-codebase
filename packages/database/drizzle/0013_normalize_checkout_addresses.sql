DELETE FROM "PaymentIntent";
--> statement-breakpoint
DELETE FROM "OrderStatusHistory";
--> statement-breakpoint
DELETE FROM "OrderItem";
--> statement-breakpoint
DELETE FROM "Order";
--> statement-breakpoint
DELETE FROM "DeliveryInfo";
--> statement-breakpoint

CREATE TABLE "Country" (
	"id" text PRIMARY KEY NOT NULL,
	"isoCode2" text NOT NULL,
	"isoCode3" text,
	"name" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "State" (
	"id" text PRIMARY KEY NOT NULL,
	"countryId" text NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "City" (
	"id" text PRIMARY KEY NOT NULL,
	"stateId" text NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CustomerAddress" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"countryId" text NOT NULL,
	"stateId" text NOT NULL,
	"cityId" text NOT NULL,
	"streetLine1" text NOT NULL,
	"streetLine2" text,
	"referenceNote" text,
	"postalCode" text,
	"recipientName" text,
	"phone" text,
	"label" text,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "State" ADD CONSTRAINT "State_countryId_Country_id_fk" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_State_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_CustomerProfile_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."CustomerProfile"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_countryId_Country_id_fk" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_stateId_State_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_cityId_City_id_fk" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

CREATE UNIQUE INDEX "Country_isoCode2_key" ON "Country" USING btree ("isoCode2");
--> statement-breakpoint
CREATE UNIQUE INDEX "Country_name_key" ON "Country" USING btree ("name");
--> statement-breakpoint
CREATE INDEX "State_countryId_idx" ON "State" USING btree ("countryId");
--> statement-breakpoint
CREATE UNIQUE INDEX "State_countryId_name_key" ON "State" USING btree ("countryId","name");
--> statement-breakpoint
CREATE UNIQUE INDEX "State_countryId_code_key" ON "State" USING btree ("countryId","code") WHERE "code" is not null;
--> statement-breakpoint
CREATE INDEX "City_stateId_idx" ON "City" USING btree ("stateId");
--> statement-breakpoint
CREATE UNIQUE INDEX "City_stateId_name_key" ON "City" USING btree ("stateId","name");
--> statement-breakpoint
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress" USING btree ("customerId");
--> statement-breakpoint
CREATE INDEX "CustomerAddress_customerId_cityId_idx" ON "CustomerAddress" USING btree ("customerId","cityId");
--> statement-breakpoint
CREATE UNIQUE INDEX "CustomerAddress_customerId_default_key" ON "CustomerAddress" USING btree ("customerId") WHERE "isDefault" = true;
--> statement-breakpoint

INSERT INTO "Country" ("id", "isoCode2", "isoCode3", "name", "isActive")
VALUES ('country_py', 'PY', 'PRY', 'Paraguay', true);
--> statement-breakpoint
INSERT INTO "State" ("id", "countryId", "code", "name")
VALUES
	('state_py_capital', 'country_py', 'ASU', 'Capital'),
	('state_py_central', 'country_py', '11', 'Central'),
	('state_py_itapua', 'country_py', '7', 'Itapúa');
--> statement-breakpoint
INSERT INTO "City" ("id", "stateId", "name")
VALUES
	('city_py_asuncion', 'state_py_capital', 'Asunción'),
	('city_py_capiata', 'state_py_central', 'Capiatá'),
	('city_py_encarnacion', 'state_py_itapua', 'Encarnación'),
	('city_py_fernando_de_la_mora', 'state_py_central', 'Fernando de la Mora'),
	('city_py_limpio', 'state_py_central', 'Limpio'),
	('city_py_luque', 'state_py_central', 'Luque'),
	('city_py_mariano_roque_alonso', 'state_py_central', 'Mariano Roque Alonso'),
	('city_py_nemby', 'state_py_central', 'Ñemby'),
	('city_py_san_antonio', 'state_py_central', 'San Antonio'),
	('city_py_san_lorenzo', 'state_py_central', 'San Lorenzo'),
	('city_py_villa_elisa', 'state_py_central', 'Villa Elisa');
--> statement-breakpoint

ALTER TABLE "DeliveryInfo" DROP COLUMN "addressLine1";
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" DROP COLUMN "addressLine2";
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" DROP COLUMN "city";
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" DROP COLUMN "reference";
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "countryId" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "stateId" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "cityId" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "streetLine1" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "streetLine2" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "referenceNote" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD COLUMN "postalCode" text;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_countryId_Country_id_fk" FOREIGN KEY ("countryId") REFERENCES "public"."Country"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_stateId_State_id_fk" FOREIGN KEY ("stateId") REFERENCES "public"."State"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "DeliveryInfo" ADD CONSTRAINT "DeliveryInfo_cityId_City_id_fk" FOREIGN KEY ("cityId") REFERENCES "public"."City"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "DeliveryInfo_countryId_stateId_cityId_idx" ON "DeliveryInfo" USING btree ("countryId","stateId","cityId");
