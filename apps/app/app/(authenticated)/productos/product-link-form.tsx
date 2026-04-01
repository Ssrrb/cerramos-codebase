"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import {
  buildProductLinkPublicPath,
  formatProductLinkStatusLabel,
  type ProductLinkFormValues,
  productLinkFormSchema,
  type ProductLinkTableRow,
  productLinkStatusValues,
  type ProductWithLinkTableRow,
  toProductLinkFormValues,
  toProductLinkPayload,
} from "@/lib/product-links";

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
    resolver: zodResolver(productLinkFormSchema) as Resolver<ProductLinkFormValues>,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const isEditing = Boolean(productLink?.id);
  const watchedSlug = form.watch("slug");

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
        <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
          <p className="font-medium text-sm text-foreground">URL publica</p>
          <p className="mt-1 break-all text-muted-foreground text-sm">
            {buildProductLinkPublicPath(
              product.commerceSlug ?? "commerce",
              watchedSlug || "-"
            )}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulo visible</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Titulo del checkout"
                  />
                </FormControl>
                <FormDescription>
                  Este texto es el que ve el comprador en el checkout.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="mate-premium"
                  />
                </FormControl>
                <FormDescription>
                  Se normaliza a minusculas y guiones automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Describe brevemente la oferta que vera el comprador."
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    inputMode="numeric"
                    min={0}
                    step={1}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {productLinkStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatProductLinkStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expira el</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    type="datetime-local"
                  />
                </FormControl>
                <FormDescription>
                  Opcional. Dejalo vacio para no expirar automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="paymentRequired"
            render={({ field }) => (
              <FormItem className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <FormLabel>Pago online obligatorio</FormLabel>
                    <FormDescription>
                      Si está activo, el pedido se crea con pago pendiente.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryEnabled"
            render={({ field }) => (
              <FormItem className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <FormLabel>Delivery</FormLabel>
                    <FormDescription>
                      Permite que el comprador cargue direccion de entrega.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pickupEnabled"
            render={({ field }) => (
              <FormItem className="rounded-xl border border-border/70 bg-muted/30 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <FormLabel>Retiro</FormLabel>
                    <FormDescription>
                      Permite coordinar retiro sin direccion.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={Boolean(field.value)}
                      disabled={isPending}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
