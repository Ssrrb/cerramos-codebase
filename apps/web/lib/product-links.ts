import {
  and,
  database,
  eq,
  isMissingRelationError,
  schema,
} from "@repo/database";
import {
  extractProductImageObjectKey,
  normalizeStoredProductImageReference,
} from "@repo/storage/product-image";
import { cache } from "react";
import { z } from "zod";
import { normalizeCheckoutCommerceLogoUrl } from "@/lib/commerce";

export const checkoutOrderPayloadSchema = z
  .object({
    addressLine1: z.string().trim().max(160).default(""),
    addressLine2: z.string().trim().max(160).default(""),
    city: z.string().trim().max(120).default(""),
    email: z.string().trim().email({ message: "Ingresa un email valido." }),
    mode: z.enum(["delivery", "pickup"], {
      error: "Selecciona una modalidad valida.",
    }),
    notes: z.string().trim().max(400).default(""),
    phone: z.string().trim().min(1, {
      message: "Ingresa un telefono valido.",
    }),
    recipientName: z.string().trim().min(1, {
      message: "Ingresa el nombre de quien recibe el pedido.",
    }),
    reference: z.string().trim().max(160).default(""),
  })
  .superRefine((value, context) => {
    if (value.mode !== "delivery") {
      return;
    }

    if (!value.city) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicá la ciudad de entrega.",
        path: ["city"],
      });
    }

    if (!value.addressLine1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá la direccion de entrega.",
        path: ["addressLine1"],
      });
    }
  });

export type CheckoutOrderPayload = z.infer<typeof checkoutOrderPayloadSchema>;

export interface ProductLinkCheckoutRecord {
  commerceId: string;
  commerceLogoImageUrl: string | null;
  commerceName: string;
  commerceSlug: string;
  currency: string;
  defaultOrderExpiryHours: number;
  deliveryEnabled: boolean;
  description: string | null;
  expiresAt: Date | null;
  imageReference: string | null;
  imageUrl: string | null;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  productId: string;
  productLinkId: string;
  slug: string;
  title: string;
  trustState:
    | "pending_review"
    | "verified"
    | "limited"
    | "rejected"
    | "suspended";
  unitPrice: number;
}

export interface CreateOrderResult {
  orderId: string;
  paymentIntentId: string | null;
  paymentRequired: boolean;
  upayFormId: string | null;
}

export class ProductLinkCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductLinkCheckoutError";
  }
}

const formatPriceLabel = (value: number) =>
  `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`;

const buildPublicProductImagePath = (objectKey: string) =>
  `/api/product-link-images?objectKey=${encodeURIComponent(objectKey)}`;

const normalizeCheckoutProductImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedReference = normalizeStoredProductImageReference(
    imageUrl,
    process.env.GCS_BUCKET_NAME
  );
  const objectKey = getPublicProductImageObjectKey(
    normalizedReference,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return normalizedReference || imageUrl;
  }

  // Public checkout pages cannot rely on raw bucket URLs or signed URLs being
  // stable, so canonical object keys are always rewritten through our proxy.
  return buildPublicProductImagePath(objectKey);
};

const resolveCheckoutProductImage = (
  candidate: string | null | undefined
): { imageReference: string | null; imageUrl: string | null } => {
  const normalizedReference = normalizeStoredProductImageReference(
    candidate,
    process.env.GCS_BUCKET_NAME
  );

  if (normalizedReference) {
    return {
      imageReference: normalizedReference,
      imageUrl: normalizeCheckoutProductImageUrl(normalizedReference),
    };
  }

  return {
    imageReference: null,
    imageUrl: null,
  };
};

export const getPublicProductLinkCheckout = cache(
  async (
    commerceSlug: string,
    productLinkSlug: string
  ): Promise<ProductLinkCheckoutRecord | null> => {
    let record:
      | {
          commerceId: string;
          commerceLogoImageUrl: string | null;
          commerceName: string;
          commerceSlug: string;
          currency: string;
          defaultOrderExpiryHours: number;
          deliveryEnabled: boolean;
          description: string | null;
          expiresAt: Date | null;
          imageObjectKey: string | null;
          paymentRequired: boolean;
          pickupEnabled: boolean;
          productId: string;
          productLinkId: string;
          productLinkStatus: "active" | "draft" | "expired" | "inactive";
          productStatus: "active" | "draft" | "inactive";
          slug: string;
          title: string;
          trustState:
            | "limited"
            | "pending_review"
            | "rejected"
            | "suspended"
            | "verified";
          unitPrice: number;
        }
      | undefined;

    try {
      [record] = await database
        .select({
          commerceId: schema.commerce.id,
          commerceLogoImageUrl: schema.commerce.logoImageUrl,
          commerceName: schema.commerce.name,
          commerceSlug: schema.commerce.slug,
          currency: schema.productLink.currency,
          defaultOrderExpiryHours: schema.commerce.defaultOrderExpiryHours,
          deliveryEnabled: schema.productLink.deliveryEnabled,
          description: schema.productLink.description,
          expiresAt: schema.productLink.expiresAt,
          imageObjectKey: schema.productImage.objectKey,
          paymentRequired: schema.productLink.paymentRequired,
          pickupEnabled: schema.productLink.pickupEnabled,
          productId: schema.product.id,
          productLinkId: schema.productLink.id,
          productStatus: schema.product.status,
          productLinkStatus: schema.productLink.status,
          slug: schema.productLink.slug,
          title: schema.productLink.title,
          trustState: schema.commerce.trustState,
          unitPrice: schema.productLink.unitPrice,
        })
        .from(schema.commerce)
        .innerJoin(
          schema.productLink,
          and(
            eq(schema.productLink.commerceId, schema.commerce.id),
            eq(schema.productLink.slug, productLinkSlug)
          )
        )
        .innerJoin(
          schema.product,
          eq(schema.product.id, schema.productLink.productId)
        )
        .innerJoin(
          schema.productImage,
          // Checkout requires a single display image. Joining through the
          // product's primary image guarantees a deterministic asset for the
          // public view model.
          eq(schema.productImage.id, schema.product.primaryImageId)
        )
        .where(eq(schema.commerce.slug, commerceSlug));
    } catch (error) {
      if (isMissingRelationError(error, "ProductLink")) {
        return null;
      }

      throw error;
    }

    if (!record) {
      return null;
    }

    if (record.productLinkStatus !== "active") {
      return null;
    }

    if (record.productStatus !== "active") {
      return null;
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const productImage = resolveCheckoutProductImage(record.imageObjectKey);

    return {
      commerceId: record.commerceId,
      commerceLogoImageUrl: normalizeCheckoutCommerceLogoUrl(
        record.commerceLogoImageUrl
      ),
      commerceName: record.commerceName,
      commerceSlug: record.commerceSlug,
      currency: record.currency,
      defaultOrderExpiryHours: record.defaultOrderExpiryHours,
      deliveryEnabled: record.deliveryEnabled,
      description: record.description,
      expiresAt: record.expiresAt,
      imageReference: productImage.imageReference,
      imageUrl: productImage.imageUrl,
      paymentRequired: record.paymentRequired,
      pickupEnabled: record.pickupEnabled,
      productId: record.productId,
      productLinkId: record.productLinkId,
      slug: record.slug,
      title: record.title,
      trustState: record.trustState,
      unitPrice: record.unitPrice,
    };
  }
);

export const createCheckoutViewModel = (record: ProductLinkCheckoutRecord) => ({
  merchant: {
    avatarUrl: record.commerceLogoImageUrl,
    name: record.commerceName,
    trustState: record.trustState,
  },
  orderSummary: {
    badgeLabel: "",
    helperText:
      "El pedido se crea con snapshot inmutable y el servidor vuelve a validar precio, disponibilidad y vigencia.",
    rows: [
      {
        label: "Modalidades",
        value: [
          record.deliveryEnabled ? "delivery" : null,
          record.pickupEnabled ? "retiro" : null,
        ]
          .filter(Boolean)
          .join(" + "),
      },
    ],
    shippingLabel: "A coordinar",
    subtotalLabel: formatPriceLabel(record.unitPrice),
    title: "Tu pedido",
    totalLabel: formatPriceLabel(record.unitPrice),
  },
  product: {
    description:
      record.description ??
      "Oferta publicada desde Cerramos para cerrar el pedido sin salir de la misma URL.",
    imageUrl: record.imageUrl ?? "",
    name: record.title,
    priceLabel: formatPriceLabel(record.unitPrice),
  },
});

export const getPublicProductImageObjectKey = (
  value: string | null,
  bucketName?: string
) => {
  if (!value) {
    return "";
  }

  return extractProductImageObjectKey(value.trim(), bucketName);
};

export const createOrderFromProductLink = async (
  commerceSlug: string,
  productLinkSlug: string,
  payload: CheckoutOrderPayload
): Promise<CreateOrderResult | null> => {
  const record = await getPublicProductLinkCheckout(
    commerceSlug,
    productLinkSlug
  );

  if (!record) {
    return null;
  }

  if (payload.mode === "delivery" && !record.deliveryEnabled) {
    throw new ProductLinkCheckoutError("Este link no permite delivery.");
  }

  if (payload.mode === "pickup" && !record.pickupEnabled) {
    throw new ProductLinkCheckoutError("Este link no permite retiro.");
  }

  if (record.paymentRequired && record.trustState !== "verified") {
    throw new ProductLinkCheckoutError(
      "El pago online todavia no esta disponible para este link."
    );
  }

  const expiresAt = new Date(
    Date.now() + record.defaultOrderExpiryHours * 60 * 60 * 1000
  );

  return database.transaction(async (tx) => {
    const [existingCustomer] = await tx
      .select({
        id: schema.customer.id,
      })
      .from(schema.customer)
      .where(eq(schema.customer.email, payload.email));

    const [customer] = existingCustomer
      ? await tx
          .update(schema.customer)
          .set({
            email: payload.email,
            name: payload.recipientName,
            phone: payload.phone,
            updatedAt: new Date(),
          })
          .where(eq(schema.customer.id, existingCustomer.id))
          .returning({
            id: schema.customer.id,
          })
      : await tx
          .insert(schema.customer)
          .values({
            email: payload.email,
            name: payload.recipientName,
            phone: payload.phone,
          })
          .returning({
            id: schema.customer.id,
          });

    const [deliveryInfo] = await tx
      .insert(schema.deliveryInfo)
      .values({
        addressLine1: payload.mode === "delivery" ? payload.addressLine1 : null,
        addressLine2: payload.mode === "delivery" ? payload.addressLine2 : null,
        city: payload.mode === "delivery" ? payload.city : null,
        customerId: customer.id,
        email: payload.email,
        mode: payload.mode,
        notes: payload.notes || null,
        phone: payload.phone,
        recipientName: payload.recipientName,
        reference: payload.mode === "delivery" ? payload.reference : null,
      })
      .returning({
        id: schema.deliveryInfo.id,
      });

    const orderStatus = record.paymentRequired ? "pending_payment" : "new";
    const paymentStatus = record.paymentRequired ? "pending" : "not_required";

    const [order] = await tx
      .insert(schema.order)
      .values({
        commerceId: record.commerceId,
        customerId: customer.id,
        deliveryInfoId: deliveryInfo.id,
        expiresAt,
        fulfillmentType: payload.mode,
        note: payload.notes || null,
        orderStatus,
        paymentStatus,
        productLinkId: record.productLinkId,
        quantity: 1,
        subtotal: record.unitPrice,
        total: record.unitPrice,
        currency: record.currency,
      })
      .returning({
        id: schema.order.id,
      });

    await tx.insert(schema.orderItem).values({
      description: record.description,
      imageObjectKey: record.imageReference,
      orderId: order.id,
      productId: record.productId,
      productLinkId: record.productLinkId,
      quantity: 1,
      title: record.title,
      totalPrice: record.unitPrice,
      unitPrice: record.unitPrice,
      variantLabel: null,
    });

    await tx.insert(schema.orderStatusHistory).values({
      changedByType: "buyer",
      orderId: order.id,
      reason: "checkout_created",
      toStatus: orderStatus,
    });

    let paymentIntentId: string | null = null;

    if (record.paymentRequired) {
      const [paymentIntent] = await tx
        .insert(schema.paymentIntent)
        .values({
          amount: record.unitPrice,
          currency: record.currency,
          expiresAt,
          method: null,
          orderId: order.id,
          provider: "pagopar_upay",
          providerMetadata: {
            commerceSlug: record.commerceSlug,
            productLinkSlug: record.slug,
          },
          status: "pending",
        })
        .returning({
          id: schema.paymentIntent.id,
        });

      paymentIntentId = paymentIntent.id;
    }

    return {
      orderId: order.id,
      paymentIntentId,
      paymentRequired: record.paymentRequired,
      upayFormId: paymentIntentId,
    };
  });
};
