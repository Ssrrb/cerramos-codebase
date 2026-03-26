import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
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

export const fulfillmentTypeEnum = pgEnum("FulfillmentType", [
  "delivery",
  "pickup",
]);

export const deliveryModeEnum = pgEnum("DeliveryMode", ["delivery", "pickup"]);

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

export const customer = pgTable(
  "Customer",
  {
    id: cuidPrimaryKey(),
    email: text("email"),
    name: text("name"),
    phone: text("phone"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("Customer_email_key").on(table.email)]
);

export const user = pgTable(
  "user",
  {
    id: cuidPrimaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    role: appUserRoleEnum("role").notNull().default("buyer"),
    commerceId: text("commerceId").references(() => commerce.id),
    customerId: text("customerId").references(() => customer.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("user_email_key").on(table.email),
    index("user_commerceId_idx").on(table.commerceId),
    index("user_customerId_idx").on(table.customerId),
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

export const productLink = pgTable(
  "ProductLink",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("imageUrl"),
    currency: text("currency").notNull().default("PYG"),
    unitPrice: integer("unitPrice").notNull(),
    status: productLinkStatusEnum("status").notNull().default("draft"),
    paymentRequired: boolean("paymentRequired").notNull().default(false),
    pickupEnabled: boolean("pickupEnabled").notNull().default(true),
    deliveryEnabled: boolean("deliveryEnabled").notNull().default(true),
    expiresAt: timestamp("expiresAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("ProductLink_slug_key").on(table.slug),
    index("ProductLink_commerceId_idx").on(table.commerceId),
  ]
);

export const product = pgTable(
  "Product",
  {
    id: cuidPrimaryKey(),
    commerceId: text("commerceId")
      .notNull()
      .references(() => commerce.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    status: productStatusEnum("status").notNull().default("draft"),
    stock: integer("stock").notNull().default(0),
    deliveryIncluded: boolean("deliveryIncluded").notNull().default(false),
    image: text("image").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("Product_commerceId_idx").on(table.commerceId)]
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
      .references(() => customer.id, { onDelete: "cascade" }),
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
      .references(() => customer.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    granted: boolean("granted").notNull().default(false),
    grantedAt: timestamp("grantedAt", { mode: "date", precision: 3 }),
    revokedAt: timestamp("revokedAt", { mode: "date", precision: 3 }),
    createdAt: createdAt(),
  },
  (table) => [index("CustomerConsent_customerId_idx").on(table.customerId)]
);

export const deliveryInfo = pgTable(
  "DeliveryInfo",
  {
    id: cuidPrimaryKey(),
    customerId: text("customerId").references(() => customer.id, {
      onDelete: "set null",
    }),
    mode: deliveryModeEnum("mode").notNull(),
    recipientName: text("recipientName").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    addressLine1: text("addressLine1"),
    addressLine2: text("addressLine2"),
    city: text("city"),
    reference: text("reference"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("DeliveryInfo_customerId_idx").on(table.customerId)]
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
      .references(() => customer.id, { onDelete: "restrict" }),
    deliveryInfoId: text("deliveryInfoId")
      .notNull()
      .references(() => deliveryInfo.id, { onDelete: "restrict" }),
    orderStatus: orderStatusEnum("orderStatus").notNull().default("new"),
    paymentStatus: paymentStatusEnum("paymentStatus")
      .notNull()
      .default("not_required"),
    fulfillmentType: fulfillmentTypeEnum("fulfillmentType").notNull(),
    quantity: integer("quantity").notNull().default(1),
    note: text("note"),
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
  ]
);

export const orderItem = pgTable(
  "OrderItem",
  {
    id: cuidPrimaryKey(),
    orderId: text("orderId")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productLinkId: text("productLinkId")
      .notNull()
      .references(() => productLink.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unitPrice").notNull(),
    totalPrice: integer("totalPrice").notNull(),
    variantLabel: text("variantLabel"),
    createdAt: createdAt(),
  },
  (table) => [
    index("OrderItem_orderId_idx").on(table.orderId),
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
