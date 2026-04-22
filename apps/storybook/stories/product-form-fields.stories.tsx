import { zodResolver } from "@hookform/resolvers/zod";
import { ProductBasicsSection } from "@repo/design-system/components/product/product-basics-section";
import { ProductCategorySelect } from "@repo/design-system/components/product/product-category-select";
import { ProductDeliveryToggle } from "@repo/design-system/components/product/product-delivery-toggle";
import { ProductDescriptionField } from "@repo/design-system/components/product/product-description-field";
import { ProductImageUpload } from "@repo/design-system/components/product/product-image-upload";
import { ProductNameField } from "@repo/design-system/components/product/product-name-field";
import { ProductPriceField } from "@repo/design-system/components/product/product-price-field";
import { ProductStatusSelect } from "@repo/design-system/components/product/product-status-select";
import { ProductStockField } from "@repo/design-system/components/product/product-stock-field";
import type { ProductFieldProps } from "@repo/design-system/components/product/types";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/design-system/components/ui/radio-group";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckIcon, PencilLineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type {
  FieldPath,
  FieldValues,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  type AddProductFormValues,
  addProductFormSchema,
  defaultAddProductFormValues,
  productCategorySuggestions,
  productStatusValues,
} from "../../app/lib/products";

const meta: Meta<typeof ProductBasicsSection> = {
  title: "product/Product Form Fields",
  component: ProductBasicsSection,
  tags: ["autodocs"],
} satisfies Meta<typeof ProductBasicsSection>;

export default meta;

type Story = StoryObj<typeof meta>;

const statusOptions = productStatusValues.map((status) => ({
  label: (() => {
    if (status === "active") {
      return "Activo";
    }

    if (status === "inactive") {
      return "Inactivo";
    }

    return "Borrador";
  })(),
  value: status,
}));

const categoryOptions = productCategorySuggestions.map((category) => ({
  label: category,
  value: category,
}));

const StoryForm = ({
  children,
}: {
  children: (form: UseFormReturn<AddProductFormValues>) => ReactNode;
}) => {
  const form = useForm<AddProductFormValues>({
    defaultValues: defaultAddProductFormValues,
    resolver: zodResolver(
      addProductFormSchema
    ) as Resolver<AddProductFormValues>,
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Form {...form}>
        <form className="space-y-6">{children(form)}</form>
      </Form>
    </div>
  );
};

const renderNameField = (form: UseFormReturn<AddProductFormValues>) => (
  <ProductNameField control={form.control} name="name" />
);

export const NameField: Story = {
  render: () => <StoryForm>{renderNameField}</StoryForm>,
};

export const DescriptionField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDescriptionField control={form.control} name="description" />
      )}
    </StoryForm>
  ),
};

export const StatusField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductStatusSelect
          control={form.control}
          name="status"
          options={statusOptions}
        />
      )}
    </StoryForm>
  ),
};

export const StockField: Story = {
  render: () => (
    <StoryForm>
      {(form) => <ProductStockField control={form.control} name="stock" />}
    </StoryForm>
  ),
};

export const DeliveryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductDeliveryToggle control={form.control} name="deliveryIncluded" />
      )}
    </StoryForm>
  ),
};

export const CategoryField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductCategorySelect
          control={form.control}
          name="category"
          options={categoryOptions}
        />
      )}
    </StoryForm>
  ),
};

export const ImageField: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductImageUpload
          control={form.control}
          name="image"
          uploadUrl="/api/products/image-upload"
        />
      )}
    </StoryForm>
  ),
};

export const BasicsSection: Story = {
  render: () => (
    <StoryForm>
      {(form) => (
        <ProductBasicsSection
          categoryName="category"
          categoryOptions={categoryOptions}
          control={form.control}
          deliveryIncludedName="deliveryIncluded"
          descriptionName="description"
          imageName="image"
          imageUploadUrl="/api/products/image-upload"
          nameName="name"
          priceName="unitPrice"
          statusName="status"
          statusOptions={statusOptions}
          stockName="stock"
        />
      )}
    </StoryForm>
  ),
};

const sequentialProductFormSchema = addProductFormSchema.extend({
  deliveryNeeded: z.boolean().default(false),
  paymentStyle: z.enum(["subscription", "one-payment"]),
  productType: z.enum(["service", "product"]),
});

type SequentialProductFormValues = z.infer<typeof sequentialProductFormSchema>;
type SequentialStepId =
  | "productType"
  | "paymentStyle"
  | "deliveryNeeded"
  | "details";
type SequentialCompletedSteps = Partial<Record<SequentialStepId, true>>;

interface ChoiceOption {
  description: string;
  title: string;
  value: string;
}

type ChoiceCardsFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = ProductFieldProps<TFieldValues, TName> & {
  options: ChoiceOption[];
};

const sequentialDefaultValues: SequentialProductFormValues = {
  ...defaultAddProductFormValues,
  deliveryNeeded: false,
  paymentStyle: "one-payment",
  productType: "product",
};

const productTypeOptions: ChoiceOption[] = [
  {
    value: "service",
    title: "Servicio",
    description:
      "Consultorías, clases, mantenimiento o cualquier oferta sin stock físico.",
  },
  {
    value: "product",
    title: "Producto",
    description:
      "Artículos físicos con inventario, fotos y posible coordinación de entrega.",
  },
];

const paymentStyleOptions: ChoiceOption[] = [
  {
    value: "subscription",
    title: "Suscripción",
    description:
      "Cobrás de forma recurrente. El detalle final mostrará un precio periódico.",
  },
  {
    value: "one-payment",
    title: "Pago único",
    description: "Cobrás una sola vez por cada venta o reserva del producto.",
  },
];

const getProductTypeLabel = (
  value: SequentialProductFormValues["productType"]
) => (value === "service" ? "Servicio" : "Producto");

const getPaymentStyleLabel = (
  value: SequentialProductFormValues["paymentStyle"]
) => (value === "subscription" ? "Suscripción" : "Pago único");

const getDeliveryNeededLabel = (value: boolean) =>
  value ? "Sí, requiere entrega" : "No, no requiere entrega";

function ChoiceCardsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  description,
  disabled,
  label,
  name,
  options,
}: ChoiceCardsFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <div className="space-y-1">
            <FormLabel>{label}</FormLabel>
            {description ? (
              <FormDescription>{description}</FormDescription>
            ) : null}
          </div>
          <FormControl>
            <RadioGroup
              className="grid gap-3 md:grid-cols-2"
              onValueChange={field.onChange}
              value={String(field.value ?? "")}
            >
              {options.map((option) => {
                const itemId = `${String(name)}-${option.value}`;
                const isSelected = field.value === option.value;

                return (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background hover:border-foreground/20",
                      disabled ? "pointer-events-none opacity-60" : ""
                    )}
                    htmlFor={itemId}
                    key={option.value}
                  >
                    <RadioGroupItem
                      className={cn(
                        "mt-0.5",
                        isSelected
                          ? "border-background text-background"
                          : "border-border/80 text-primary"
                      )}
                      disabled={disabled}
                      id={itemId}
                      value={option.value}
                    />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{option.title}</div>
                      <div
                        className={cn(
                          "text-sm leading-relaxed",
                          isSelected
                            ? "text-background/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DeliveryNeedField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: ProductFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <div className="space-y-1">
            <FormLabel>{props.label ?? "¿Necesita entrega?"}</FormLabel>
            <FormDescription>
              {props.description ??
                "Definí si esta oferta necesita coordinación de entrega o si se consume sin logística."}
            </FormDescription>
          </div>
          <FormControl>
            <RadioGroup
              className="grid gap-3 md:grid-cols-2"
              onValueChange={(value) => field.onChange(value === "true")}
              value={field.value ? "true" : "false"}
            >
              {[
                {
                  value: "true",
                  title: "Sí, requiere entrega",
                  description:
                    "Mostrá esta opción para productos físicos o servicios que incluyan una visita o traslado.",
                },
                {
                  value: "false",
                  title: "No, no requiere entrega",
                  description:
                    "Ideal para servicios digitales, retiros en local o productos que no dependen de envío.",
                },
              ].map((option) => {
                const itemId = `${String(props.name)}-${option.value}`;
                const isSelected =
                  String(Boolean(field.value)) === option.value;

                return (
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background hover:border-foreground/20",
                      props.disabled ? "pointer-events-none opacity-60" : ""
                    )}
                    htmlFor={itemId}
                    key={option.value}
                  >
                    <RadioGroupItem
                      className={cn(
                        "mt-0.5",
                        isSelected
                          ? "border-background text-background"
                          : "border-border/80 text-primary"
                      )}
                      disabled={props.disabled}
                      id={itemId}
                      value={option.value}
                    />
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{option.title}</div>
                      <div
                        className={cn(
                          "text-sm leading-relaxed",
                          isSelected
                            ? "text-background/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function StepCard({
  activeStep,
  children,
  completed,
  onEdit,
  step,
  summary,
  title,
}: {
  activeStep: SequentialStepId;
  children: ReactNode;
  completed?: boolean;
  onEdit: (step: SequentialStepId) => void;
  step: SequentialStepId;
  summary: string[];
  title: string;
}) {
  if (activeStep === step) {
    return (
      <Card className="rounded-[1.75rem] border-border/70 shadow-xs">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              Paso activo
            </p>
            <CardTitle className="text-2xl tracking-[-0.03em]">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <button
      className="w-full rounded-[1.5rem] border border-border/70 bg-background px-5 py-5 text-left shadow-xs transition-colors hover:border-foreground/20"
      onClick={() => onEdit(step)}
      type="button"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            {completed ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="size-3.5" />
              </span>
            ) : null}
            <p className="font-medium text-base text-foreground">{title}</p>
          </div>
          <div className="space-y-1">
            {summary.length > 0 ? (
              summary.map((line) => (
                <p
                  className="text-muted-foreground text-sm leading-relaxed"
                  key={line}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                Volvé a abrir este paso para ajustar la configuración.
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 font-medium text-foreground text-sm">
          <PencilLineIcon className="size-4" />
          Editar
        </span>
      </div>
    </button>
  );
}

function SequentialProductSetupStory({
  defaultValues,
}: {
  defaultValues?: Partial<SequentialProductFormValues>;
}) {
  const form = useForm<SequentialProductFormValues>({
    defaultValues: {
      ...sequentialDefaultValues,
      ...defaultValues,
    },
    resolver: zodResolver(
      sequentialProductFormSchema
    ) as Resolver<SequentialProductFormValues>,
  });
  const [activeStep, setActiveStep] = useState<SequentialStepId>("productType");
  const [completedSteps, setCompletedSteps] =
    useState<SequentialCompletedSteps>(
      defaultValues
        ? {
            productType: true,
            paymentStyle: true,
            deliveryNeeded: true,
          }
        : {}
    );
  const productType = useWatch({
    control: form.control,
    name: "productType",
  });
  const paymentStyle = useWatch({
    control: form.control,
    name: "paymentStyle",
  });
  const deliveryNeeded = useWatch({
    control: form.control,
    name: "deliveryNeeded",
  });
  const name = useWatch({
    control: form.control,
    name: "name",
  });
  const category = useWatch({
    control: form.control,
    name: "category",
  });
  const status = useWatch({
    control: form.control,
    name: "status",
  });

  const advanceStep = async (
    step: SequentialStepId,
    fields: FieldPath<SequentialProductFormValues>[],
    nextStep: SequentialStepId
  ) => {
    const isValid = await form.trigger(fields, {
      shouldFocus: true,
    });

    if (!isValid) {
      return;
    }

    setCompletedSteps((previous) => ({
      ...previous,
      [step]: true,
    }));
    setActiveStep(nextStep);
  };

  const validateDetails = async () => {
    const detailFields: FieldPath<SequentialProductFormValues>[] = [
      "image",
      "name",
      "description",
      "category",
      "unitPrice",
      "status",
    ];

    if (productType === "product") {
      detailFields.push("stock");
    }

    const isValid = await form.trigger(detailFields, {
      shouldFocus: true,
    });

    if (!isValid) {
      return;
    }

    setCompletedSteps((previous) => ({
      ...previous,
      details: true,
    }));
  };

  return (
    <div className="bg-[linear-gradient(180deg,hsl(var(--muted)/0.32),hsl(var(--background))_28%)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.45fr)_22rem] lg:px-8">
        <Form {...form}>
          <form className="space-y-4">
            <Card className="rounded-[1.75rem] border-border/70 bg-background/95 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">
                    Alta guiada
                  </p>
                  <CardTitle className="text-3xl tracking-[-0.04em]">
                    Configurá el producto en el orden en que el negocio lo
                    piensa
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-sm leading-relaxed">
                    Primero definí qué estás vendiendo y cómo se cobra. Después
                    completá los datos operativos que cambian según esa
                    decisión.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <StepCard
              activeStep={activeStep}
              completed={completedSteps.productType}
              onEdit={setActiveStep}
              step="productType"
              summary={[`Tipo elegido: ${getProductTypeLabel(productType)}`]}
              title="1. Elegí el tipo de oferta"
            >
              <div className="space-y-6">
                <ChoiceCardsField
                  control={form.control}
                  description="Esto define qué campos operativos aparecen después."
                  label="Tipo de producto"
                  name="productType"
                  options={productTypeOptions}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      await advanceStep(
                        "productType",
                        ["productType"],
                        "paymentStyle"
                      );
                    }}
                    type="button"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </StepCard>

            <StepCard
              activeStep={activeStep}
              completed={completedSteps.paymentStyle}
              onEdit={setActiveStep}
              step="paymentStyle"
              summary={[`Cobro: ${getPaymentStyleLabel(paymentStyle)}`]}
              title="2. Definí cómo se cobra"
            >
              <div className="space-y-6">
                <ChoiceCardsField
                  control={form.control}
                  description="La selección ajusta el lenguaje del precio final dentro del formulario."
                  label="Modalidad de cobro"
                  name="paymentStyle"
                  options={paymentStyleOptions}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      await advanceStep(
                        "paymentStyle",
                        ["paymentStyle"],
                        "deliveryNeeded"
                      );
                    }}
                    type="button"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </StepCard>

            <StepCard
              activeStep={activeStep}
              completed={completedSteps.deliveryNeeded}
              onEdit={setActiveStep}
              step="deliveryNeeded"
              summary={[getDeliveryNeededLabel(deliveryNeeded)]}
              title="3. Confirmá si hay logística de entrega"
            >
              <div className="space-y-6">
                <DeliveryNeedField
                  control={form.control}
                  name="deliveryNeeded"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      await advanceStep(
                        "deliveryNeeded",
                        ["deliveryNeeded"],
                        "details"
                      );
                    }}
                    type="button"
                  >
                    Completar datos
                  </Button>
                </div>
              </div>
            </StepCard>

            <StepCard
              activeStep={activeStep}
              completed={completedSteps.details}
              onEdit={setActiveStep}
              step="details"
              summary={[
                name?.trim() ? name : "Nombre pendiente",
                category?.trim()
                  ? `Categoría: ${category}`
                  : "Categoría pendiente",
                `Estado: ${statusOptions.find((option) => option.value === status)?.label ?? "Borrador"}`,
              ]}
              title="4. Cargá los datos del producto"
            >
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.9fr)]">
                  <div className="space-y-6">
                    <ProductNameField control={form.control} name="name" />
                    <ProductDescriptionField
                      control={form.control}
                      name="description"
                    />
                  </div>
                  <div className="space-y-6">
                    <ProductImageUpload
                      control={form.control}
                      name="image"
                      uploadUrl="/api/products/image-upload"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-6 md:grid-cols-3">
                  <ProductPriceField
                    control={form.control}
                    description={
                      paymentStyle === "subscription"
                        ? "Monto recurrente que se cobrará en cada renovación."
                        : "Monto único que se cobrará en cada compra."
                    }
                    label={
                      paymentStyle === "subscription"
                        ? "Precio recurrente"
                        : "Precio único"
                    }
                    name="unitPrice"
                  />
                  <ProductStatusSelect
                    control={form.control}
                    name="status"
                    options={statusOptions}
                  />
                  {productType === "product" ? (
                    <ProductStockField control={form.control} name="stock" />
                  ) : (
                    <Card className="justify-center rounded-2xl border-border/70 border-dashed bg-muted/20 py-0 shadow-none">
                      <CardContent className="px-5 py-5">
                        <p className="font-medium text-foreground text-sm">
                          Stock no aplica
                        </p>
                        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                          Los servicios no muestran inventario dentro de esta
                          versión del flujo.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <ProductCategorySelect
                    control={form.control}
                    name="category"
                    options={categoryOptions}
                  />
                  <Card className="rounded-2xl border-border/70 bg-muted/25 py-0 shadow-none">
                    <CardContent className="px-5 py-5">
                      <p className="font-medium text-foreground text-sm">
                        Resumen operativo
                      </p>
                      <div className="mt-3 space-y-2 text-sm leading-relaxed">
                        <p className="text-muted-foreground">
                          {getProductTypeLabel(productType)} con{" "}
                          {getPaymentStyleLabel(paymentStyle).toLowerCase()}.
                        </p>
                        <p className="text-muted-foreground">
                          {deliveryNeeded
                            ? "La oferta requiere una etapa de coordinación o entrega."
                            : "La oferta no depende de una logística de entrega."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      await validateDetails();
                    }}
                    type="button"
                  >
                    Validar configuración
                  </Button>
                </div>
              </div>
            </StepCard>
          </form>
        </Form>

        <div className="space-y-4">
          <Card className="rounded-[1.5rem] border-border/70 bg-background/95 shadow-xs lg:sticky lg:top-8">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Resumen del flujo</CardTitle>
              <CardDescription>
                La historia mantiene visibles las decisiones principales
                mientras se completa el resto del formulario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium text-foreground">
                  {getProductTypeLabel(productType)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Cobro</p>
                <p className="font-medium text-foreground">
                  {getPaymentStyleLabel(paymentStyle)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Entrega</p>
                <p className="font-medium text-foreground">
                  {deliveryNeeded ? "Requerida" : "No requerida"}
                </p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground">Campos condicionados</p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed">
                  <li>
                    {productType === "product"
                      ? "Se muestra stock porque el tipo elegido es producto."
                      : "El stock se oculta porque el tipo elegido es servicio."}
                  </li>
                  <li>
                    {paymentStyle === "subscription"
                      ? "El precio usa copy recurrente para una suscripción."
                      : "El precio usa copy de pago único."}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const SequentialFlow: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => <SequentialProductSetupStory />,
};

export const ServiceSubscription: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <SequentialProductSetupStory
      defaultValues={{
        category: "Tecnologia",
        deliveryNeeded: false,
        description:
          "Acceso mensual a soporte técnico remoto y mantenimiento preventivo por videollamada.",
        name: "Mantenimiento mensual de equipos",
        paymentStyle: "subscription",
        productType: "service",
        status: "active",
        unitPrice: 185_000,
      }}
    />
  ),
};

export const PhysicalProductOnePayment: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <SequentialProductSetupStory
      defaultValues={{
        category: "Hogar",
        deliveryNeeded: true,
        description:
          "Juego de contenedores herméticos para cocina con tres tamaños y cierre seguro.",
        name: "Set de contenedores apilables",
        paymentStyle: "one-payment",
        productType: "product",
        status: "draft",
        stock: 24,
        unitPrice: 129_000,
      }}
    />
  ),
};
