import { z } from "zod";

export const productStatusValues = ["active", "inactive", "draft"] as const;

export type ProductStatus = (typeof productStatusValues)[number];

export const productCategorySuggestions = [
  "Electrodomesticos",
  "Belleza",
  "Hogar",
  "Moda",
  "Tecnologia",
  "Accesorios",
  "Deportes",
] as const;

export const productImageUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, { message: "La imagen necesita un nombre de archivo." }),
  objectKey: z
    .string()
    .trim()
    .min(1, { message: "La imagen del producto es obligatoria." }),
  src: z
    .string()
    .trim()
    .min(1, { message: "La imagen del producto es obligatoria." }),
});

export const productImageUploadRequestSchema = z.object({
  contentType: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  size: z
    .coerce
    .number({
      error: "Ingresa un tamano valido.",
    })
    .int()
    .positive()
    .max(5 * 1024 * 1024, {
      message: "La imagen debe pesar menos de 5 MB.",
    }),
});

export const addProductFormSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, { message: "Selecciona o crea una categoria." })
    .max(50, { message: "La categoria debe tener 50 caracteres o menos." }),
  deliveryIncluded: z.boolean().default(false),
  description: z
    .string()
    .trim()
    .min(1, { message: "La descripcion es obligatoria." })
    .max(400, {
      message: "La descripcion debe tener 400 caracteres o menos.",
    }),
  image: productImageUploadSchema,
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre del producto es obligatorio." })
    .max(80, { message: "El nombre debe tener 80 caracteres o menos." }),
  status: z.enum(productStatusValues, {
    error: "Selecciona un estado valido.",
  }),
  stock: z
    .coerce
    .number({
      error: "Ingresa una cantidad valida.",
    })
    .int({ message: "El stock debe ser un numero entero." })
    .min(0, { message: "El stock no puede ser negativo." }),
});

export const productPayloadSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, { message: "Selecciona o crea una categoria." })
    .max(50, { message: "La categoria debe tener 50 caracteres o menos." }),
  deliveryIncluded: z.boolean().default(false),
  description: z
    .string()
    .trim()
    .min(1, { message: "La descripcion es obligatoria." })
    .max(400, {
      message: "La descripcion debe tener 400 caracteres o menos.",
    }),
  imageObjectKey: z
    .string()
    .trim()
    .min(1, { message: "La imagen del producto es obligatoria." }),
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre del producto es obligatorio." })
    .max(80, { message: "El nombre debe tener 80 caracteres o menos." }),
  status: z.enum(productStatusValues, {
    error: "Selecciona un estado valido.",
  }),
  stock: z
    .coerce
    .number({
      error: "Ingresa una cantidad valida.",
    })
    .int({ message: "El stock debe ser un numero entero." })
    .min(0, { message: "El stock no puede ser negativo." }),
});

export type ProductImageUploadValue = z.infer<typeof productImageUploadSchema>;
export type ProductImageUploadRequest = z.infer<
  typeof productImageUploadRequestSchema
>;
export type AddProductFormValues = z.infer<typeof addProductFormSchema>;
export type ProductPayload = z.infer<typeof productPayloadSchema>;

export const defaultAddProductFormValues: AddProductFormValues = {
  category: productCategorySuggestions[0],
  deliveryIncluded: false,
  description: "",
  image: {
    fileName: "",
    objectKey: "",
    src: "",
  },
  name: "",
  status: "draft",
  stock: 0,
};

export const toProductPayload = (
  values: AddProductFormValues
): ProductPayload => ({
  category: values.category,
  deliveryIncluded: values.deliveryIncluded,
  description: values.description,
  imageObjectKey: values.image.objectKey,
  name: values.name,
  status: values.status,
  stock: values.stock,
});

export interface ProductTableRow {
  category: string;
  deliveryIncluded: boolean;
  description: string;
  id: string;
  image: string;
  name: string;
  status: ProductStatus;
  stock: number;
}

export const formatProductStatusLabel = (status: ProductStatus) => {
  switch (status) {
    case "active":
      return "Activo";
    case "inactive":
      return "Inactivo";
    case "draft":
      return "Borrador";
  }
};

export const formatDeliveryIncludedLabel = (deliveryIncluded: boolean) =>
  deliveryIncluded ? "Incluida" : "No incluida";
