"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { ProductBasicsSection } from "@repo/design-system/components/product/product-basics-section";
import { Alert, AlertDescription } from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import {
  addProductFormSchema,
  defaultAddProductFormValues,
  type AddProductFormValues,
  productCategorySuggestions,
  type ProductPayload,
  productStatusValues,
  toProductPayload,
} from "@/lib/products";

interface AddProductFormProps {
  onSuccess?: () => void;
}

interface ProductApiErrorPayload {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
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

const statusOptions = productStatusValues.map((status) => ({
  label:
    status === "active"
      ? "Activo"
      : status === "inactive"
        ? "Inactivo"
        : "Borrador",
  value: status,
}));

export const AddProductForm = ({ onSuccess }: AddProductFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<AddProductFormValues>({
    defaultValues: defaultAddProductFormValues,
    resolver: zodResolver(addProductFormSchema) as any,
  });

  const onSubmit = (values: AddProductFormValues) => {
    setError(null);
    setSuccess(null);
    form.clearErrors();

    const payload: ProductPayload = toProductPayload(values);

    startTransition(async () => {
      try {
        const response = await fetch("/api/products", {
          body: JSON.stringify(payload),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        const responsePayload = (await response.json().catch(() => null)) as
          | ProductApiErrorPayload
          | {
              id: string;
              success: true;
            }
          | null;

        if (!response.ok) {
          const errorPayload = responsePayload as ProductApiErrorPayload | null;

          applyServerFieldErrors(form, errorPayload?.fieldErrors);
          setError(errorPayload?.error ?? "No se pudo guardar el producto.");
          return;
        }

        form.reset(defaultAddProductFormValues);
        setSuccess("Producto creado correctamente.");
        router.refresh();
        onSuccess?.();
      } catch {
        setError("No se pudo guardar el producto.");
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
          control={form.control as any}
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
        <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-4 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            onClick={() => form.reset(defaultAddProductFormValues)}
            type="button"
            variant="ghost"
          >
            Limpiar
          </Button>
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" />
                Guardando producto
              </>
            ) : (
              "Guardar producto"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
