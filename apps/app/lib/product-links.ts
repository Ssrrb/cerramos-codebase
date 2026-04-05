import { z } from "zod";
import type { ProductTableRow } from "@/lib/products";

export const productLinkStatusValues = [
  "draft",
  "active",
  "inactive",
  "expired",
] as const;

export type ProductLinkStatus = (typeof productLinkStatusValues)[number];

export interface ProductLinkTableRow {
  currency: string;
  deliveryEnabled: boolean;
  description: string | null;
  expiresAt: string | null;
  id: string;
  imageUrl: string | null;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  publicPath: string;
  slug: string;
  status: ProductLinkStatus;
  title: string;
  unitPrice: number;
}

export interface ProductLinkFormValues {
  deliveryEnabled: boolean;
  description: string;
  expiresAt: string;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  slug: string;
  status: ProductLinkStatus;
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
  deliveryEnabled: z.boolean(),
  description: z.string().trim().max(400, {
    message: "La descripcion debe tener 400 caracteres o menos.",
  }),
  expiresAt: z.string().trim().max(40),
  paymentRequired: z.boolean(),
  pickupEnabled: z.boolean(),
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
    if (!(value.pickupEnabled || value.deliveryEnabled)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Activa delivery o retiro para publicar el link.",
        path: ["deliveryEnabled"],
      });
    }

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
  deliveryEnabled: true,
  description: product.description,
  expiresAt: "",
  paymentRequired: false,
  pickupEnabled: true,
  slug: normalizeProductLinkSlug(product.name),
  status: "draft",
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
    deliveryEnabled: productLink.deliveryEnabled,
    description: productLink.description ?? "",
    expiresAt: productLink.expiresAt ? productLink.expiresAt.slice(0, 16) : "",
    paymentRequired: productLink.paymentRequired,
    pickupEnabled: productLink.pickupEnabled,
    slug: productLink.slug,
    status: productLink.status,
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
