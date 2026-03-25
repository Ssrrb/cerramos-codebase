"use server";

import { auth } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CreateProductLinkActionState } from "../components/products-catalog.types";

const booleanField = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const createProductLinkSchema = z
  .object({
    deliveryEnabled: booleanField,
    description: z.string().trim().max(500).optional(),
    imageUrl: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) =>
          !value || /^https?:\/\/.+/i.test(value) || /^\/.+/.test(value),
        "Ingresa una URL de imagen valida."
      ),
    paymentRequired: booleanField,
    pickupEnabled: booleanField,
    status: z.enum(["draft", "active", "inactive", "expired"]),
    title: z.string().trim().min(2, "Ingresa un nombre mas claro."),
    unitPrice: z.coerce
      .number()
      .int("El precio debe ser un numero entero.")
      .min(0, "El precio no puede ser negativo."),
  })
  .refine((value) => value.pickupEnabled || value.deliveryEnabled, {
    message: "Activa retiro, entrega o ambas opciones.",
    path: ["pickupEnabled"],
  });

const slugifyProductTitle = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "producto";

const findAvailableProductSlug = async (title: string) => {
  const baseSlug = slugifyProductTitle(title);
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const existingProduct = await database
      .select({ id: schema.productLink.id })
      .from(schema.productLink)
      .where(eq(schema.productLink.slug, candidate))
      .limit(1);

    if (existingProduct.length === 0) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

export const createProductLinkAction = async (
  _previousState: CreateProductLinkActionState,
  formData: FormData
): Promise<CreateProductLinkActionState> => {
  const { orgId } = await auth();

  if (!orgId) {
    return {
      message: "Necesitas un comercio activo para crear productos.",
      status: "error",
    };
  }

  const parsed = createProductLinkSchema.safeParse({
    deliveryEnabled: formData.get("deliveryEnabled"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    paymentRequired: formData.get("paymentRequired"),
    pickupEnabled: formData.get("pickupEnabled"),
    status: formData.get("status"),
    title: formData.get("title"),
    unitPrice: formData.get("unitPrice"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados y vuelve a intentar.",
      status: "error",
    };
  }

  const slug = await findAvailableProductSlug(parsed.data.title);

  await database.insert(schema.productLink).values({
    commerceId: orgId,
    deliveryEnabled: parsed.data.deliveryEnabled,
    description: parsed.data.description?.trim() || null,
    imageUrl: parsed.data.imageUrl?.trim() || null,
    paymentRequired: parsed.data.paymentRequired,
    pickupEnabled: parsed.data.pickupEnabled,
    slug,
    status: parsed.data.status,
    title: parsed.data.title,
    unitPrice: parsed.data.unitPrice,
  });

  revalidatePath("/");

  return {
    message: "Producto agregado al catálogo.",
    status: "success",
  };
};
