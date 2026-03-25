import { z } from "zod";

export const productCategories = [
  "T-shirts",
  "Shoes",
  "Accessories",
  "Bags",
  "Dresses",
  "Jackets",
  "Gloves",
] as const;

export const productColors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

export const productSizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const productColorEnum = z.enum(productColors);
const productSizeEnum = z.enum(productSizes);
const productCategoryEnum = z.enum(productCategories);

export const productPayloadSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Product name is required." }),
    shortDescription: z
      .string()
      .trim()
      .min(1, { message: "Short description is required." })
      .max(60, { message: "Short description must be 60 characters or less." }),
    description: z
      .string()
      .trim()
      .min(1, { message: "Description is required." }),
    category: productCategoryEnum,
    unitPrice: z
      .number()
      .int({ message: "Unit price must be a whole number." })
      .positive({ message: "Unit price must be greater than 0." }),
    currency: z.literal("PYG").default("PYG"),
    sizes: z.array(productSizeEnum).min(1, {
      message: "Select at least one available size.",
    }),
    colors: z.array(productColorEnum).min(1, {
      message: "Select at least one available color.",
    }),
    images: z.record(z.string(), z.string().trim()),
  })
  .superRefine((input, context) => {
    const selectedColors = new Set(input.colors);
    const imageEntries = Object.entries(input.images);

    for (const color of input.colors) {
      const imageValue = input.images[color];

      if (!imageValue || imageValue.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Add an image URL or path for ${color}.`,
          path: ["images", color],
        });
      }
    }

    for (const [color, image] of imageEntries) {
      if (!selectedColors.has(color as (typeof productColors)[number])) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remove the extra image for ${color}.`,
          path: ["images", color],
        });
      }

      if (image.trim().length === 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Add an image URL or path for ${color}.`,
          path: ["images", color],
        });
      }
    }
  });

export type ProductPayload = z.infer<typeof productPayloadSchema>;

export const defaultProductFormValues: ProductPayload = {
  category: "T-shirts",
  colors: [],
  currency: "PYG",
  description: "",
  images: {},
  name: "",
  shortDescription: "",
  sizes: [],
  unitPrice: 0,
};

export interface ProductTableRow {
  category: string;
  colors: string[];
  description: string;
  id: string;
  images: Record<string, string>;
  name: string;
  shortDescription: string;
  sizes: string[];
  unitPrice: number;
}

export const resolvePrimaryProductImage = (
  product: Pick<ProductTableRow, "colors" | "images">
) => {
  for (const color of product.colors) {
    const image = product.images[color];

    if (image) {
      return image;
    }
  }

  return null;
};

export const formatProductPrice = (unitPrice: number) =>
  new Intl.NumberFormat("es-PY", {
    currency: "PYG",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(unitPrice);
