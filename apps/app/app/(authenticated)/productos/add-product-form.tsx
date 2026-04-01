"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ProductBasicsSection } from "@repo/design-system/components/product/product-basics-section";
import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import {
  type AddProductFormValues,
  addProductFormSchema,
  defaultAddProductFormValues,
  normalizeProductImageObjectKey,
  type ProductPayload,
  type ProductTableRow,
  productCategorySuggestions,
  productStatusValues,
  toProductPayload,
} from "@/lib/products";

interface AddProductFormProps {
  mode?: "create" | "edit";
  onSuccess?: () => void;
  product?: ProductTableRow;
}

interface ProductApiErrorPayload {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

interface ProductApiSuccessPayload {
  id: string;
  success: true;
}

const applyServerFieldErrors = (
  form: UseFormReturn<AddProductFormValues>,
  fieldErrors?: ProductApiErrorPayload["fieldErrors"]
) => {
  if (!fieldErrors) {
    return;
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (!messages?.[0]) {
      continue;
    }

    if (field === "imageObjectKey") {
      form.setError("image", {
        message: messages[0],
      });
      continue;
    }

    form.setError(field as keyof AddProductFormValues, {
      message: messages[0],
    });
  }
};

const categoryOptions = productCategorySuggestions.map((category) => ({
  label: category,
  value: category,
}));

const getStatusLabel = (status: (typeof productStatusValues)[number]) => {
  switch (status) {
    case "active":
      return "Activo";
    case "inactive":
      return "Inactivo";
    case "draft":
      return "Borrador";
    default:
      return "Borrador";
  }
};

const statusOptions = productStatusValues.map((status) => ({
  label: getStatusLabel(status),
  value: status,
}));

const toInitialFormValues = (
  product?: ProductTableRow
): AddProductFormValues => {
  if (!product) {
    return defaultAddProductFormValues;
  }

  return {
    category: product.category,
    deliveryIncluded: product.deliveryIncluded,
    description: product.description,
    image: {
      fileName:
        product.imageObjectKey.split("/").at(-1) ?? `${product.name}.png`,
      objectKey: product.imageObjectKey,
      src: product.image,
    },
    name: product.name,
    status: product.status,
    stock: product.stock,
    unitPrice: product.unitPrice,
  };
};

const getSubmitErrorMessage = (isEditing: boolean) =>
  isEditing
    ? "No se pudo actualizar el producto."
    : "No se pudo guardar el producto.";

const getSuccessMessage = (isEditing: boolean) =>
  isEditing
    ? "Producto actualizado correctamente."
    : "Producto creado correctamente.";

const getPendingLabel = (isEditing: boolean) =>
  isEditing ? "Actualizando producto" : "Guardando producto";

const getSubmitLabel = (isEditing: boolean) =>
  isEditing ? "Guardar cambios" : "Guardar producto";

export const AddProductForm = ({
  mode = "create",
  onSuccess,
  product,
}: AddProductFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialValues = useMemo(() => toInitialFormValues(product), [product]);
  const form = useForm<AddProductFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(addProductFormSchema),
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const isEditing = mode === "edit" && product;

  const submitProduct = async (payload: ProductPayload) => {
    const response = await fetch(
      isEditing ? `/api/products/${product.id}` : "/api/products",
      {
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
        method: isEditing ? "PATCH" : "POST",
      }
    );

    const responsePayload = (await response.json().catch(() => null)) as
      | ProductApiErrorPayload
      | ProductApiSuccessPayload
      | null;

    if (!response.ok) {
      const errorPayload = responsePayload as ProductApiErrorPayload | null;

      applyServerFieldErrors(form, errorPayload?.fieldErrors);
      setError(errorPayload?.error ?? getSubmitErrorMessage(isEditing));
      return false;
    }

    form.reset(
      isEditing ? toInitialFormValues(product) : defaultAddProductFormValues
    );
    setSuccess(getSuccessMessage(isEditing));
    router.refresh();
    onSuccess?.();
    return true;
  };

  const onSubmit = (values: AddProductFormValues) => {
    setError(null);
    setSuccess(null);
    form.clearErrors();

    const payload: ProductPayload = toProductPayload(
      values,
      process.env.NEXT_PUBLIC_GCS_BUCKET_NAME ?? process.env.GCS_BUCKET_NAME
    );

    if (!normalizeProductImageObjectKey(payload.imageObjectKey)) {
      form.setError("image", {
        message: "La imagen del producto es obligatoria.",
      });
      return;
    }

    startTransition(async () => {
      try {
        await submitProduct(payload);
      } catch {
        setError(getSubmitErrorMessage(isEditing));
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : null}
        <ProductBasicsSection
          categoryName="category"
          categoryOptions={categoryOptions}
          control={form.control}
          deliveryIncludedName="deliveryIncluded"
          descriptionName="description"
          disabled={isPending}
          imageName="image"
          imageUploadUrl="/api/products/image-upload"
          nameName="name"
          priceName="unitPrice"
          statusName="status"
          statusOptions={statusOptions}
          stockName="stock"
        />
        <div className="flex flex-col-reverse gap-3 border-border/70 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            onClick={() => form.reset(initialValues)}
            type="button"
            variant="ghost"
          >
            {isEditing ? "Restaurar" : "Limpiar"}
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" />
                {getPendingLabel(isEditing)}
              </>
            ) : (
              getSubmitLabel(isEditing)
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
