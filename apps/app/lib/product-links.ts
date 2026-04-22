import { z } from "zod";
import type { ProductTableRow } from "@/lib/products";

export const productLinkStatusValues = [
  "draft",
  "active",
  "inactive",
  "expired",
] as const;
export const billingModeValues = ["one_time", "subscription"] as const;
export const fulfillmentModeValues = [
  "none",
  "delivery",
  "pickup",
  "delivery_or_pickup",
] as const;
export const subscriptionCadenceValues = ["monthly"] as const;

export type ProductLinkStatus = (typeof productLinkStatusValues)[number];
export type BillingMode = (typeof billingModeValues)[number];
export type FulfillmentMode = (typeof fulfillmentModeValues)[number];
export type SubscriptionCadence = (typeof subscriptionCadenceValues)[number];

export interface ProductLinkTableRow {
  billingMode: BillingMode;
  currency: string;
  description: string | null;
  expiresAt: string | null;
  fulfillmentMode: FulfillmentMode;
  id: string;
  imageUrl: string | null;
  paymentRequired: boolean;
  publicPath: string;
  slug: string;
  status: ProductLinkStatus;
  subscriptionCadence: SubscriptionCadence | null;
  title: string;
  unitPrice: number;
}

export interface ProductLinkFormValues {
  billingMode: BillingMode;
  description: string;
  expiresAt: string;
  fulfillmentMode: FulfillmentMode;
  paymentRequired: boolean;
  slug: string;
  status: ProductLinkStatus;
  subscriptionCadence: SubscriptionCadence;
  title: string;
  unitPrice: number;
}

export interface ProductLinkPayload extends ProductLinkFormValues {
  productId: string;
}

export interface ProductWithLinkTableRow extends ProductTableRow {
  commerceSlug?: string;
  productLink?: ProductLinkTableRow | null;
}

const PRODUCT_LINK_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productLinksMigrationRequiredMessage =
  "Los links publicos no estan disponibles en esta base de datos. Ejecuta bun run db:migrate para aplicar las migraciones pendientes.";

export const singleProductLinkPerProductMessage =
  "Este producto ya tiene un link publico. Edita el link actual en lugar de crear otro.";

export const normalizeProductLinkSlug = (value: string) =>
  value
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");

const productLinkFormSchemaShape = {
  billingMode: z.enum(billingModeValues).default("one_time"),
  description: z.string().trim().max(400, {
    message: "La descripcion debe tener 400 caracteres o menos.",
  }),
  expiresAt: z.string().trim().max(40),
  fulfillmentMode: z.enum(fulfillmentModeValues).default("delivery_or_pickup"),
  paymentRequired: z.boolean(),
  slug: z
    .string()
    .trim()
    .min(1, { message: "El slug del link es obligatorio." })
    .max(80, {
      message: "El slug del link debe tener 80 caracteres o menos.",
    })
    .transform(normalizeProductLinkSlug)
    .refine((value) => PRODUCT_LINK_SLUG_PATTERN.test(value), {
      message: "Usa solo letras, numeros y guiones.",
    }),
  status: z.enum(productLinkStatusValues, {
    error: "Selecciona un estado valido.",
  }),
  subscriptionCadence: z.enum(subscriptionCadenceValues).default("monthly"),
  title: z
    .string()
    .trim()
    .min(1, { message: "El titulo del link es obligatorio." })
    .max(120, {
      message: "El titulo debe tener 120 caracteres o menos.",
    }),
  unitPrice: z.coerce
    .number({
      error: "Ingresa un precio valido.",
    })
    .int({ message: "El precio debe ser un numero entero." })
    .min(0, { message: "El precio no puede ser negativo." }),
} as const;

const refineProductLinkSchema = <
  TSchema extends z.ZodObject<Record<string, z.ZodTypeAny>>,
>(
  schemaToRefine: TSchema
) =>
  schemaToRefine.superRefine((value, context) => {
    const expiresAt =
      typeof value.expiresAt === "string" ? value.expiresAt : "";

    if (expiresAt) {
      const parsed = new Date(expiresAt);

      if (Number.isNaN(parsed.getTime())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresa una fecha de expiracion valida.",
          path: ["expiresAt"],
        });
      }
    }

    if (value.billingMode === "subscription" && !value.paymentRequired) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las suscripciones requieren pago online obligatorio.",
        path: ["paymentRequired"],
      });
    }
  });

export const productLinkFormSchema = refineProductLinkSchema(
  z.object(productLinkFormSchemaShape)
);

export const productLinkPayloadSchema = refineProductLinkSchema(
  z.object({
    ...productLinkFormSchemaShape,
    productId: z.string().trim().min(1, {
      message: "El producto es obligatorio.",
    }),
  })
);

export const buildProductLinkPublicPath = (
  commerceSlug: string,
  slug: string
) => `/buy/${commerceSlug}/${slug}`;

export const buildPublicProductImagePath = (objectKey: string) =>
  `/api/product-link-images?objectKey=${encodeURIComponent(objectKey)}`;

export const parseProductLinkExpiresAt = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const defaultProductLinkFormValues = (
  product: ProductTableRow
): ProductLinkFormValues => ({
  billingMode: "one_time",
  description: product.description,
  expiresAt: "",
  fulfillmentMode:
    product.kind === "service"
      ? product.deliveryIncluded
        ? "delivery_or_pickup"
        : "none"
      : "delivery_or_pickup",
  paymentRequired: false,
  slug: normalizeProductLinkSlug(product.name),
  status: "draft",
  subscriptionCadence: "monthly",
  title: product.name,
  unitPrice: product.unitPrice,
});

export const toProductLinkFormValues = (
  product: ProductTableRow,
  productLink?: ProductLinkTableRow | null
): ProductLinkFormValues => {
  if (!productLink) {
    return defaultProductLinkFormValues(product);
  }

  return {
    billingMode: productLink.billingMode,
    description: productLink.description ?? "",
    expiresAt: productLink.expiresAt ? productLink.expiresAt.slice(0, 16) : "",
    fulfillmentMode: productLink.fulfillmentMode,
    paymentRequired: productLink.paymentRequired,
    slug: productLink.slug,
    status: productLink.status,
    subscriptionCadence: productLink.subscriptionCadence ?? "monthly",
    title: productLink.title,
    unitPrice: productLink.unitPrice,
  };
};

export const toProductLinkPayload = (
  productId: string,
  values: ProductLinkFormValues
): ProductLinkPayload => ({
  ...values,
  productId,
  slug: normalizeProductLinkSlug(values.slug),
});

export const formatProductLinkStatusLabel = (status: ProductLinkStatus) => {
  switch (status) {
    case "active":
      return "Activo";
    case "draft":
      return "Borrador";
    case "expired":
      return "Expirado";
    case "inactive":
      return "Inactivo";
    default:
      return "Borrador";
  }
};

export const formatBillingModeLabel = (value: BillingMode) =>
  value === "subscription" ? "Suscripción" : "Pago único";

export const formatFulfillmentModeLabel = (value: FulfillmentMode) => {
  switch (value) {
    case "delivery":
      return "Solo delivery";
    case "pickup":
      return "Solo retiro";
    case "none":
      return "Sin entrega";
    case "delivery_or_pickup":
      return "Delivery o retiro";
    default:
      return "Delivery o retiro";
  }
};
