"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ProductLinkPublishingSection } from "@repo/design-system/components/product/product-link-publishing-section";
import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  buildProductLinkPublicPath,
  billingModeValues,
  formatBillingModeLabel,
  formatFulfillmentModeLabel,
  formatProductLinkStatusLabel,
  fulfillmentModeValues,
  type ProductLinkFormValues,
  type ProductLinkTableRow,
  type ProductWithLinkTableRow,
  productLinkFormSchema,
  productLinkStatusValues,
  subscriptionCadenceValues,
  toProductLinkFormValues,
  toProductLinkPayload,
} from "@/lib/product-links";
import { formatProductUnitPriceLabel } from "@/lib/products";

interface ProductLinkFormProps {
  onSuccess?: () => void;
  product: ProductWithLinkTableRow;
  productLink?: ProductLinkTableRow | null;
}

interface ProductLinkApiErrorPayload {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

interface ProductLinkApiSuccessPayload {
  id: string;
  success: true;
}

const applyServerFieldErrors = (
  setError: ReturnType<typeof useForm<ProductLinkFormValues>>["setError"],
  fieldErrors?: ProductLinkApiErrorPayload["fieldErrors"]
) => {
  if (!fieldErrors) {
    return;
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (!messages?.[0]) {
      continue;
    }

    setError(field as keyof ProductLinkFormValues, {
      message: messages[0],
    });
  }
};

const getSubmitErrorMessage = (isEditing: boolean) =>
  isEditing
    ? "No se pudo actualizar el link publico."
    : "No se pudo crear el link publico.";

const getSuccessMessage = (isEditing: boolean) =>
  isEditing
    ? "Link publico actualizado correctamente."
    : "Link publico creado correctamente.";

const getPendingLabel = (isEditing: boolean) =>
  isEditing ? "Actualizando link" : "Creando link";

const getSubmitLabel = (isEditing: boolean) =>
  isEditing ? "Guardar link" : "Publicar link";

const billingModeOptions = billingModeValues.map((value) => ({
  label: formatBillingModeLabel(value),
  value,
}));

const fulfillmentModeOptions = fulfillmentModeValues.map((value) => ({
  label: formatFulfillmentModeLabel(value),
  value,
}));

const statusOptions = productLinkStatusValues.map((value) => ({
  label: formatProductLinkStatusLabel(value),
  value,
}));

const subscriptionCadenceOptions = subscriptionCadenceValues.map((value) => ({
  label: "Mensual",
  value,
}));

export const ProductLinkForm = ({
  onSuccess,
  product,
  productLink,
}: ProductLinkFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initialValues = useMemo(
    () => toProductLinkFormValues(product, productLink),
    [product, productLink]
  );
  const form = useForm<ProductLinkFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(
      productLinkFormSchema
    ) as Resolver<ProductLinkFormValues>,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const isEditing = Boolean(productLink?.id);
  const watchedSlug = form.watch("slug");
  const publicPath = buildProductLinkPublicPath(
    product.commerceSlug ?? "commerce",
    watchedSlug || "-"
  );
  const displayedProductPrice = formatProductUnitPriceLabel(
    initialValues.unitPrice
  );

  const submitLink = async (values: ProductLinkFormValues) => {
    const response = await fetch(
      isEditing
        ? `/api/product-links/${productLink?.id}`
        : "/api/product-links",
      {
        body: JSON.stringify(toProductLinkPayload(product.id, values)),
        headers: {
          "content-type": "application/json",
        },
        method: isEditing ? "PATCH" : "POST",
      }
    );

    const payload = (await response.json().catch(() => null)) as
      | ProductLinkApiErrorPayload
      | ProductLinkApiSuccessPayload
      | null;

    if (!response.ok) {
      const errorPayload = payload as ProductLinkApiErrorPayload | null;

      applyServerFieldErrors(form.setError, errorPayload?.fieldErrors);
      setError(errorPayload?.error ?? getSubmitErrorMessage(isEditing));
      return;
    }

    setSuccess(getSuccessMessage(isEditing));
    router.refresh();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => {
          setError(null);
          setSuccess(null);
          form.clearErrors();

          startTransition(async () => {
            try {
              await submitLink(values);
            } catch {
              setError(getSubmitErrorMessage(isEditing));
            }
          });
        })}
      >
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
        <ProductLinkPublishingSection
          billingModeName="billingMode"
          billingModeOptions={billingModeOptions}
          control={form.control}
          descriptionName="description"
          disabled={isPending}
          expiresAtName="expiresAt"
          fulfillmentModeName="fulfillmentMode"
          fulfillmentModeOptions={fulfillmentModeOptions}
          paymentRequiredName="paymentRequired"
          publicPath={publicPath}
          productImageUrl={product.image}
          productName={product.name}
          productPriceLabel={`Gs. ${displayedProductPrice}`}
          slugName="slug"
          statusName="status"
          statusOptions={statusOptions}
          subscriptionCadenceName="subscriptionCadence"
          subscriptionCadenceOptions={subscriptionCadenceOptions}
          titleName="title"
        />
        <div className="flex flex-col-reverse gap-3 border-border/70 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            onClick={() => form.reset(initialValues)}
            type="button"
            variant="ghost"
          >
            Restaurar
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
