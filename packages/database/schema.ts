import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const cuid = () => createId();
const createdAt = (name = "createdAt") =>
  timestamp(name, { mode: "date", precision: 3 }).notNull().defaultNow();
const updatedAt = (name = "updatedAt") =>
  timestamp(name, { mode: "date", precision: 3 }).notNull().defaultNow();
const cuidPrimaryKey = (name = "id") =>
  text(name).primaryKey().$defaultFn(cuid);

export const commerceTrustStateEnum = pgEnum("CommerceTrustState", [
  "pending_review",
  "verified",
  "limited",
  "rejected",
  "suspended",
]);

export const productLinkStatusEnum = pgEnum("ProductLinkStatus", [
  "draft",
  "active",
  "inactive",
  "expired",
]);

export const productStatusEnum = pgEnum("ProductStatus", [
  "draft",
  "active",
  "inactive",
]);

export const productKindEnum = pgEnum("ProductKind", ["product", "service"]);

export const deliveryModeEnum = pgEnum("DeliveryMode", [
  "none",
  "delivery",
  "pickup",
]);

export const billingModeEnum = pgEnum("BillingMode", [
  "one_time",
  "subscription",
]);

export const fulfillmentModeEnum = pgEnum("FulfillmentMode", [
  "none",
  "delivery",
  "pickup",
  "delivery_or_pickup",
]);

export const subscriptionCadenceEnum = pgEnum("SubscriptionCadence", [
  "monthly",
]);

export const orderStatusEnum = pgEnum("OrderStatus", [
  "new",
  "pending_payment",
  "paid",
  "confirmed",
  "expired",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("PaymentStatus", [
  "not_required",
  "pending",
  "authorized",
  "paid",
  "failed",
  "expired",
  "cancelled",
]);

export const paymentRiskStateEnum = pgEnum("PaymentRiskState", [
  "pending",
  "held",
  "release_ready",
  "reverse_pending",
  "reversed",
]);

export const paymentProviderNameEnum = pgEnum("PaymentProviderName", [
  "pagopar_upay",
  "manual",
]);

export const paymentMethodTypeEnum = pgEnum("PaymentMethodType", [
  "in_store",
  "cash_on_delivery",
  "upay_card",
  "upay_bank_transfer",
  "other",
]);

export const customerIdentityProviderEnum = pgEnum("CustomerIdentityProvider", [
  "password",
  "google",
]);

export const appUserRoleEnum = pgEnum("AppUserRole", [
  "buyer",
  "merchant_admin",
  "operator",
]);

export const merchantProfileRoleEnum = pgEnum("MerchantProfileRole", ["owner"]);

export const page = pgTable(
  "Page",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => [index("Page_name_idx").on(table.name)]
);

export const commerce = pgTable(
  "Commerce",
  {
    id: cuidPrimaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    legalName: text("legalName"),
    logoImageUrl: text("logoImageUrl"),
    trustState: commerceTrustStateEnum("trustState")
      .notNull()
      .default("pending_review"),
    trustScore: integer("trustScore").notNull().default(0),
    defaultOrderExpiryHours: integer("defaultOrderExpiryHours")
      .notNull()
      .default(24),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("Commerce_slug_key").on(table.slug)]
);

export const customerProfile = pgTable(
  "CustomerProfile",
  {
    id: cuidPrimaryKey(),
    userId: text("userId").references((): AnyPgColumn => user.id, {
      onDelete: "set null",
    }),
    email: text("email"),
    name: text("name"),
    phone: text("phone"),
    image: text("image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("CustomerProfile_email_key").on(table.email),
    uniqueIndex("CustomerProfile_userId_key").on(table.userId),
    index("CustomerProfile_userId_idx").on(table.userId),
  ]
);

export const customer = customerProfile;

export const user = pgTable(
  "user",
  {
    id: cuidPrimaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    // Compatibility mirrors for the existing auth/session code. These stop
    // being the source of truth once profile-based reads are migrated.
    role: appUserRoleEnum("role").notNull().default("buyer"),
    commerceId: text("commerceId").references(() => commerce.id),
    customerId: text("customerId").references(() => customerProfile.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("user_email_key").on(table.email),
    index("user_commerceId_idx").on(table.commerceId),
    index("user_customerId_idx").on(table.customerId),
  ]
);

export const merchantProfile = pgTable(
  "MerchantProfile",
  {
    id: cuidPrimaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    role: merchantProfileRoleEnum("role").notNull().default("owner"),
    phone: text("phone"),
    legalFullName: text("legalFullName"),
    dateOfBirth: timestamp("dateOfBirth", { mode: "date", precision: 3 }),
    nationality: text("nationality"),
    governmentId: text("governmentId"),
    residentialAddress: text("residentialAddress"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("MerchantProfile_userId_key").on(table.userId),
    uniqueIndex("MerchantProfile_commerceId_key").on(table.commerceId),
    index("MerchantProfile_userId_idx").on(table.userId),
    index("MerchantProfile_commerceId_idx").on(table.commerceId),
  ]
);

export const session = pgTable(
  "session",
  {
    id: cuidPrimaryKey(),
    token: text("token").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("session_token_key").on(table.token),
    index("session_userId_idx").on(table.userId),
  ]
);

export const account = pgTable(
  "account",
  {
    id: cuidPrimaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      mode: "date",
      precision: 3,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      mode: "date",
      precision: 3,
    }),
    scope: text("scope"),
    idToken: text("idToken"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    uniqueIndex("account_providerId_accountId_key").on(
      table.providerId,
      table.accountId
    ),
  ]
);

export const verification = pgTable(
  "verification",
  {
    id: cuidPrimaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    uniqueIndex("verification_identifier_value_key").on(
      table.identifier,
      table.value
    ),
  ]
);

export const product = pgTable(
  "Product",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    kind: productKindEnum("kind").notNull().default("product"),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    unitPrice: integer("unitPrice").notNull(),
    status: productStatusEnum("status").notNull().default("draft"),
    stock: integer("stock").notNull().default(0),
    deliveryIncluded: boolean("deliveryIncluded").notNull().default(false),
    primaryImageId: text("primaryImageId").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("Product_commerceId_idx").on(table.commerceId),
    index("Product_primaryImageId_idx").on(table.primaryImageId),
    uniqueIndex("Product_id_commerceId_key").on(table.id, table.commerceId),
  ]
);

export const productImage = pgTable(
  "ProductImage",
  {
    id: cuidPrimaryKey(),
    productId: text("productId")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    objectKey: text("objectKey").notNull(),
    position: integer("position").notNull().default(0),
    altText: text("altText"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("ProductImage_productId_idx").on(table.productId),
    uniqueIndex("ProductImage_productId_position_key").on(
      table.productId,
      table.position
    ),
    uniqueIndex("ProductImage_id_productId_key").on(table.id, table.productId),
  ]
);

export const productLink = pgTable(
  "ProductLink",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    productId: text("productId").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    currency: text("currency").notNull().default("PYG"),
    unitPrice: integer("unitPrice").notNull(),
    billingMode: billingModeEnum("billingMode").notNull().default("one_time"),
    fulfillmentMode: fulfillmentModeEnum("fulfillmentMode")
      .notNull()
      .default("delivery_or_pickup"),
    subscriptionCadence: subscriptionCadenceEnum("subscriptionCadence"),
    status: productLinkStatusEnum("status").notNull().default("draft"),
    paymentRequired: boolean("paymentRequired").notNull().default(false),
    pickupEnabled: boolean("pickupEnabled").notNull().default(true),
    deliveryEnabled: boolean("deliveryEnabled").notNull().default(true),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    foreignKey({
      columns: [table.productId, table.commerceId],
      foreignColumns: [product.id, product.commerceId],
      name: "ProductLink_productId_commerceId_Product_id_commerceId_fk",
    }).onDelete("restrict"),
    uniqueIndex("ProductLink_commerceId_slug_key").on(
      table.commerceId,
      table.slug
    ),
    uniqueIndex("ProductLink_productId_key").on(table.productId),
    index("ProductLink_productId_idx").on(table.productId),
    index("ProductLink_commerceId_idx").on(table.commerceId),
    index("ProductLink_commerceId_slug_status_idx").on(
      table.commerceId,
      table.slug,
      table.status
    ),
  ]
);

export const productVariantOption = pgTable(
  "ProductVariantOption",
  {
    id: cuidPrimaryKey(),
    productLinkId: text("productLinkId")
      .notNull()
      .references(() => productLink.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    value: text("value").notNull(),
    additionalPrice: integer("additionalPrice").notNull().default(0),
    isDefault: boolean("isDefault").notNull().default(false),
  },
  (table) => [
    index("ProductVariantOption_productLinkId_idx").on(table.productLinkId),
  ]
);

export const customerIdentity = pgTable(
  "CustomerIdentity",
  {
    id: cuidPrimaryKey(),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "cascade" }),
    provider: customerIdentityProviderEnum("provider").notNull(),
    providerSubject: text("providerSubject").notNull(),
    passwordHash: text("passwordHash"),
    createdAt: createdAt(),
  },
  (table) => [
    index("CustomerIdentity_customerId_idx").on(table.customerId),
    uniqueIndex("CustomerIdentity_provider_providerSubject_key").on(
      table.provider,
      table.providerSubject
    ),
  ]
);

export const customerConsent = pgTable(
  "CustomerConsent",
  {
    id: cuidPrimaryKey(),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    granted: boolean("granted").notNull().default(false),
    grantedAt: timestamp("grantedAt", { mode: "date", precision: 3 }),
    revokedAt: timestamp("revokedAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
  },
  (table) => [index("CustomerConsent_customerId_idx").on(table.customerId)]
);

export const country = pgTable(
  "Country",
  {
    id: cuidPrimaryKey(),
    isoCode2: text("isoCode2").notNull(),
    isoCode3: text("isoCode3"),
    name: text("name").notNull(),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("Country_isoCode2_key").on(table.isoCode2),
    uniqueIndex("Country_name_key").on(table.name),
  ]
);

export const state = pgTable(
  "State",
  {
    id: cuidPrimaryKey(),
    countryId: text("countryId")
      .notNull()
      .references(() => country.id, { onDelete: "restrict" }),
    code: text("code"),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("State_countryId_idx").on(table.countryId),
    uniqueIndex("State_countryId_name_key").on(table.countryId, table.name),
    uniqueIndex("State_countryId_code_key")
      .on(table.countryId, table.code)
      .where(sql`${table.code} is not null`),
  ]
);

export const city = pgTable(
  "City",
  {
    id: cuidPrimaryKey(),
    stateId: text("stateId")
      .notNull()
      .references(() => state.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("City_stateId_idx").on(table.stateId),
    uniqueIndex("City_stateId_name_key").on(table.stateId, table.name),
  ]
);

export const customerAddress = pgTable(
  "CustomerAddress",
  {
    id: cuidPrimaryKey(),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "cascade" }),
    countryId: text("countryId")
      .notNull()
      .references(() => country.id, { onDelete: "restrict" }),
    stateId: text("stateId")
      .notNull()
      .references(() => state.id, { onDelete: "restrict" }),
    cityId: text("cityId")
      .notNull()
      .references(() => city.id, { onDelete: "restrict" }),
    streetLine1: text("streetLine1").notNull(),
    streetLine2: text("streetLine2"),
    referenceNote: text("referenceNote"),
    postalCode: text("postalCode"),
    recipientName: text("recipientName"),
    phone: text("phone"),
    label: text("label"),
    isDefault: boolean("isDefault").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("CustomerAddress_customerId_idx").on(table.customerId),
    index("CustomerAddress_customerId_cityId_idx").on(
      table.customerId,
      table.cityId
    ),
    uniqueIndex("CustomerAddress_customerId_default_key")
      .on(table.customerId)
      .where(sql`${table.isDefault} = true`),
  ]
);

export const deliveryInfo = pgTable(
  "DeliveryInfo",
  {
    id: cuidPrimaryKey(),
    customerId: text("customerId").references(() => customerProfile.id, {
      onDelete: "set null",
    }),
    customerAddressId: text("customerAddressId").references(
      () => customerAddress.id,
      {
        onDelete: "set null",
      }
    ),
    mode: deliveryModeEnum("mode").notNull(),
    recipientName: text("recipientName").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    countryId: text("countryId").references(() => country.id, {
      onDelete: "restrict",
    }),
    stateId: text("stateId").references(() => state.id, {
      onDelete: "restrict",
    }),
    cityId: text("cityId").references(() => city.id, {
      onDelete: "restrict",
    }),
    streetLine1: text("streetLine1"),
    streetLine2: text("streetLine2"),
    referenceNote: text("referenceNote"),
    postalCode: text("postalCode"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("DeliveryInfo_customerId_idx").on(table.customerId),
    index("DeliveryInfo_countryId_stateId_cityId_idx").on(
      table.countryId,
      table.stateId,
      table.cityId
    ),
  ]
);

export const order = pgTable(
  "Order",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "restrict" }),
    productLinkId: text("productLinkId")
      .notNull()
      .references(() => productLink.id, { onDelete: "restrict" }),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "restrict" }),
    deliveryInfoId: text("deliveryInfoId")
      .notNull()
      .references(() => deliveryInfo.id, { onDelete: "restrict" }),
    productKind: productKindEnum("productKind").notNull().default("product"),
    billingMode: billingModeEnum("billingMode").notNull().default("one_time"),
    fulfillmentMode: fulfillmentModeEnum("fulfillmentMode")
      .notNull()
      .default("delivery_or_pickup"),
    orderStatus: orderStatusEnum("orderStatus").notNull().default("new"),
    paymentStatus: paymentStatusEnum("paymentStatus")
      .notNull()
      .default("not_required"),
    quantity: integer("quantity").notNull().default(1),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    currency: text("currency").notNull().default("PYG"),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }).notNull(),
    confirmedAt: timestamp("confirmedAt", { mode: "date", precision: 3 }),
    cancelledAt: timestamp("cancelledAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("Order_commerceId_idx").on(table.commerceId),
    index("Order_productLinkId_idx").on(table.productLinkId),
    index("Order_customerId_idx").on(table.customerId),
    index("Order_deliveryInfoId_idx").on(table.deliveryInfoId),
    uniqueIndex("Order_deliveryInfoId_key").on(table.deliveryInfoId),
  ]
);

export const orderItem = pgTable(
  "OrderItem",
  {
    id: cuidPrimaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("productId")
      .notNull()
      .references(() => product.id, { onDelete: "restrict" }),
    productLinkId: text("productLinkId")
      .notNull()
      .references(() => productLink.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    imageObjectKey: text("imageObjectKey"),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unitPrice").notNull(),
    totalPrice: integer("totalPrice").notNull(),
    variantLabel: text("variantLabel"),
    createdAt: createdAt(),
  },
  (table) => [
    index("OrderItem_orderId_idx").on(table.orderId),
    index("OrderItem_productId_idx").on(table.productId),
    index("OrderItem_productLinkId_idx").on(table.productLinkId),
  ]
);

export const paymentIntent = pgTable(
  "PaymentIntent",
  {
    id: cuidPrimaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    provider: paymentProviderNameEnum("provider")
      .notNull()
      .default("pagopar_upay"),
    method: paymentMethodTypeEnum("method"),
    externalReference: text("externalReference"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("PYG"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    riskState: paymentRiskStateEnum("riskState").notNull().default("pending"),
    fundsReleased: boolean("fundsReleased").notNull().default(false),
    providerMetadata:
      jsonb("providerMetadata").$type<Record<string, unknown>>(),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("PaymentIntent_orderId_idx").on(table.orderId)]
);

export const paymentCustomer = pgTable(
  "PaymentCustomer",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "cascade" }),
    provider: paymentProviderNameEnum("provider")
      .notNull()
      .default("pagopar_upay"),
    externalCustomerId: text("externalCustomerId").notNull(),
    providerMetadata:
      jsonb("providerMetadata").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("PaymentCustomer_commerceId_idx").on(table.commerceId),
    index("PaymentCustomer_customerId_idx").on(table.customerId),
    uniqueIndex("PaymentCustomer_commerceId_customerId_provider_key").on(
      table.commerceId,
      table.customerId,
      table.provider
    ),
    uniqueIndex("PaymentCustomer_provider_externalCustomerId_key").on(
      table.provider,
      table.externalCustomerId
    ),
  ]
);

export const subscriptionAgreement = pgTable(
  "SubscriptionAgreement",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "restrict" }),
    customerId: text("customerId")
      .notNull()
      .references(() => customerProfile.id, { onDelete: "restrict" }),
    productLinkId: text("productLinkId")
      .notNull()
      .references(() => productLink.id, { onDelete: "restrict" }),
    orderId: text("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "restrict" }),
    paymentCustomerId: text("paymentCustomerId").references(
      () => paymentCustomer.id,
      { onDelete: "set null" }
    ),
    provider: paymentProviderNameEnum("provider")
      .notNull()
      .default("pagopar_upay"),
    cadence: subscriptionCadenceEnum("cadence").notNull().default("monthly"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("PYG"),
    status: text("status").notNull().default("pending_activation"),
    externalAgreementId: text("externalAgreementId"),
    externalCustomerId: text("externalCustomerId"),
    activatedAt: timestamp("activatedAt", { mode: "date", precision: 3 }),
    cancelledAt: timestamp("cancelledAt", { mode: "date", precision: 3 }),
    providerMetadata:
      jsonb("providerMetadata").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("SubscriptionAgreement_commerceId_idx").on(table.commerceId),
    index("SubscriptionAgreement_customerId_idx").on(table.customerId),
    index("SubscriptionAgreement_orderId_idx").on(table.orderId),
    index("SubscriptionAgreement_productLinkId_idx").on(table.productLinkId),
    uniqueIndex("SubscriptionAgreement_orderId_key").on(table.orderId),
  ]
);

export const paymentEvent = pgTable(
  "PaymentEvent",
  {
    id: cuidPrimaryKey(),
    paymentIntentId: text("paymentIntentId").references(
      () => paymentIntent.id,
      {
        onDelete: "set null",
      }
    ),
    provider: paymentProviderNameEnum("provider").notNull(),
    externalEventId: text("externalEventId"),
    eventType: text("eventType").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    receivedAt: timestamp("receivedAt", { mode: "date", precision: 3 })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processedAt", { mode: "date", precision: 3 }),
    processingResult: text("processingResult"),
  },
  (table) => [
    index("PaymentEvent_paymentIntentId_idx").on(table.paymentIntentId),
    uniqueIndex("PaymentEvent_provider_externalEventId_key").on(
      table.provider,
      table.externalEventId
    ),
  ]
);

export const orderStatusHistory = pgTable(
  "OrderStatusHistory",
  {
    id: cuidPrimaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("fromStatus"),
    toStatus: orderStatusEnum("toStatus").notNull(),
    changedByType: text("changedByType"),
    changedById: text("changedById"),
    reason: text("reason"),
    createdAt: createdAt(),
  },
  (table) => [index("OrderStatusHistory_orderId_idx").on(table.orderId)]
);
