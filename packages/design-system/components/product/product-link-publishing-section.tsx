"use client";

import {
  SequentialStepCard,
} from "@repo/design-system/components/product/product-setup-step-card";
import type { ProductSelectOption } from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import {
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
import { Separator } from "@repo/design-system/components/ui/separator";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { ExternalLinkIcon, Package2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

type ProductLinkPublishingStep = "identity" | "checkout" | "publish";

interface ProductLinkPublishingSectionProps<
  TFieldValues extends FieldValues,
> {
  billingModeName: FieldPath<TFieldValues>;
  billingModeOptions: ProductSelectOption[];
  control: Control<TFieldValues>;
  descriptionName: FieldPath<TFieldValues>;
  disabled?: boolean;
  expiresAtName: FieldPath<TFieldValues>;
  fulfillmentModeName: FieldPath<TFieldValues>;
  fulfillmentModeOptions: ProductSelectOption[];
  paymentRequiredName: FieldPath<TFieldValues>;
  publicPath: string;
  productImageUrl?: string | null;
  productName: string;
  productPriceLabel: string;
  slugName: FieldPath<TFieldValues>;
  statusName: FieldPath<TFieldValues>;
  statusOptions: ProductSelectOption[];
  subscriptionCadenceName: FieldPath<TFieldValues>;
  subscriptionCadenceOptions: ProductSelectOption[];
  titleName: FieldPath<TFieldValues>;
}

const findOptionLabel = (
  options: ProductSelectOption[],
  value: unknown,
  fallback: string
) =>
  options.find((option) => option.value === String(value))?.label ?? fallback;

const formatExpirationSummary = (value: unknown) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "Sin vencimiento automático";
  }

  const normalized = value.replace("T", " ").trim();

  return `Expira: ${normalized}`;
};

function ProductLinkPublishingSection<TFieldValues extends FieldValues>({
  billingModeName,
  billingModeOptions,
  control,
  descriptionName,
  disabled,
  expiresAtName,
  fulfillmentModeName,
  fulfillmentModeOptions,
  paymentRequiredName,
  publicPath,
  productImageUrl,
  productName,
  productPriceLabel,
  slugName,
  statusName,
  statusOptions,
  subscriptionCadenceName,
  subscriptionCadenceOptions,
  titleName,
}: ProductLinkPublishingSectionProps<TFieldValues>) {
  const [activeStep, setActiveStep] =
    useState<ProductLinkPublishingStep>("identity");
  const [completedSteps, setCompletedSteps] = useState<
    Partial<Record<ProductLinkPublishingStep, true>>
  >({});
  const titleValue = useWatch({
    control,
    name: titleName,
  });
  const billingModeValue = useWatch({
    control,
    name: billingModeName,
  });
  const paymentRequiredValue = useWatch({
    control,
    name: paymentRequiredName,
  });
  const fulfillmentModeValue = useWatch({
    control,
    name: fulfillmentModeName,
  });
  const statusValue = useWatch({
    control,
    name: statusName,
  });
  const expiresAtValue = useWatch({
    control,
    name: expiresAtName,
  });
  const subscriptionCadenceValue = useWatch({
    control,
    name: subscriptionCadenceName,
  });
  const checkoutSummary = useMemo(() => {
    const lines = [
      `Cobro: ${findOptionLabel(
        billingModeOptions,
        billingModeValue,
        "Pago único"
      )}`,
      `Entrega: ${findOptionLabel(
        fulfillmentModeOptions,
        fulfillmentModeValue,
        "Sin definir"
      )}`,
      paymentRequiredValue ? "Pago online obligatorio" : "Pago online opcional",
      `Precio base: ${productPriceLabel}`,
    ];

    if (billingModeValue === "subscription") {
      lines.splice(
        1,
        0,
        `Cadencia: ${findOptionLabel(
          subscriptionCadenceOptions,
          subscriptionCadenceValue,
          "Mensual"
        )}`
      );
    }

    return lines;
  }, [
    billingModeOptions,
    billingModeValue,
    fulfillmentModeOptions,
    fulfillmentModeValue,
    paymentRequiredValue,
    productPriceLabel,
    subscriptionCadenceOptions,
    subscriptionCadenceValue,
  ]);
  const publishSummary = [
    `Estado: ${findOptionLabel(statusOptions, statusValue, "Borrador")}`,
    formatExpirationSummary(expiresAtValue),
  ];

  return (
    <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.22),hsl(var(--background))_26%)]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="space-y-5 xl:space-y-6">
          <SequentialStepCard
            activeStep={activeStep}
            completed={completedSteps.identity}
            onEdit={setActiveStep}
            step="identity"
            summary={[
              typeof titleValue === "string" && titleValue.trim().length > 0
                ? titleValue
                : productName,
              publicPath,
            ]}
            title="1. Definí la identidad del link"
          >
            <div className="space-y-8">
              <div className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/40">
                      {productImageUrl ? (
                        /* biome-ignore lint/performance/noImgElement: shared component uses plain img across the design system */
                        <img
                          alt={productName}
                          className="h-full w-full object-cover"
                          src={productImageUrl}
                        />
                      ) : (
                        <Package2Icon className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-base text-foreground">
                        {productName}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Precio base del producto: {productPriceLabel}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">
                      Este paso solo publica el checkout
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      El producto ya quedó cargado. Aquí definís cómo se verá y
                      se usará el link público.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground text-sm">
                      URL pública
                    </p>
                    <p className="break-all text-muted-foreground text-sm">
                      {publicPath}
                    </p>
                  </div>
                  <ExternalLinkIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  control={control}
                  name={titleName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título visible</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={disabled}
                          placeholder="Título del checkout"
                        />
                      </FormControl>
                      <FormDescription>
                        Es el texto principal que verá el comprador.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={slugName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={disabled}
                          placeholder="mate-premium"
                        />
                      </FormControl>
                      <FormDescription>
                        Se normaliza en minúsculas y guiones.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={descriptionName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={disabled}
                        placeholder="Describe brevemente lo que verá el comprador en el checkout."
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      identity: true,
                    }));
                    setActiveStep("checkout");
                  }}
                  type="button"
                >
                  Continuar con checkout
                </Button>
              </div>
            </div>
          </SequentialStepCard>

          <SequentialStepCard
            activeStep={activeStep}
            completed={completedSteps.checkout}
            onEdit={setActiveStep}
            step="checkout"
            summary={checkoutSummary}
            title="2. Ajustá cobro y entrega"
          >
            <div className="space-y-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name={billingModeName}
                    render={({ field }) => (
                      <FormItem className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4">
                        <FormLabel>Modalidad de cobro</FormLabel>
                        <Select
                          disabled={disabled}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una modalidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {billingModeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Las suscripciones crean un cobro recurrente.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name={fulfillmentModeName}
                    render={({ field }) => (
                      <FormItem className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4">
                        <FormLabel>Entrega</FormLabel>
                        <Select
                          disabled={disabled}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una modalidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fulfillmentModeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Define qué logística se expone en el checkout.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 px-4 py-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground text-sm">
                        Precio base del producto
                      </p>
                      <p className="font-semibold text-2xl tracking-[-0.03em]">
                        {productPriceLabel}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      El link usa el precio que ya cargaste en el producto. Si
                      necesitas cambiarlo, volvé al paso anterior del producto y
                      actualizalo allí.
                    </p>
                  </div>
                </div>
              </div>
              <FormField
                control={control}
                name={paymentRequiredName}
                render={({ field }) => (
                  <FormItem className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <FormLabel>Pago online obligatorio</FormLabel>
                        <FormDescription>
                          Si está activo, el checkout exige dejar el pago
                          iniciado para cerrar el pedido.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          disabled={disabled}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {billingModeValue === "subscription" ? (
                <FormField
                  control={control}
                  name={subscriptionCadenceName}
                  render={({ field }) => (
                    <FormItem className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4">
                      <FormLabel>Cadencia de suscripción</FormLabel>
                      <Select
                        disabled={disabled}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una cadencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subscriptionCadenceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Esta versión mantiene la recurrencia mensual.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      checkout: true,
                    }));
                    setActiveStep("publish");
                  }}
                  type="button"
                >
                  Revisar publicación
                </Button>
              </div>
            </div>
          </SequentialStepCard>

          <SequentialStepCard
            activeStep={activeStep}
            completed={completedSteps.publish}
            onEdit={setActiveStep}
            step="publish"
            summary={publishSummary}
            title="3. Publicá el checkout"
          >
            <div className="space-y-8">
              <div className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground text-sm">
                      Revisión rápida
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Confirmá que el estado, la vigencia y la URL pública estén
                      listas antes de guardar.
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                        Link
                      </p>
                      <p className="font-medium text-sm text-foreground">
                        {typeof titleValue === "string" && titleValue.trim()
                          ? titleValue
                          : productName}
                      </p>
                      <p className="break-all text-muted-foreground text-sm">
                        {publicPath}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                        Checkout
                      </p>
                      {checkoutSummary.map((line) => (
                        <p className="text-muted-foreground text-sm" key={line}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={control}
                  name={statusName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Usa borrador mientras terminás de revisar el checkout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={expiresAtName}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expira el</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={disabled}
                          type="datetime-local"
                        />
                      </FormControl>
                      <FormDescription>
                        Opcional. Dejalo vacío si el link no debe vencer solo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={disabled}
                  onClick={() => {
                    setCompletedSteps((previous) => ({
                      ...previous,
                      publish: true,
                    }));
                  }}
                  type="button"
                  variant="outline"
                >
                  Marcar revisión lista
                </Button>
              </div>
            </div>
          </SequentialStepCard>
        </div>
      </div>
    </div>
  );
}

export { ProductLinkPublishingSection };
