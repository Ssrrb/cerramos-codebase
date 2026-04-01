"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Form } from "@repo/design-system/components/ui/form";
import { cn } from "@repo/design-system/lib/utils";
import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CheckoutDeliveryStepSection } from "./checkout-delivery-step-section";
import { CheckoutDetailsStepSection } from "./checkout-details-step-section";
import type { CheckoutDeliveryFieldNames } from "./checkout-form-fields";
import { CheckoutHeader } from "./checkout-header";
import { CheckoutMerchantCard } from "./checkout-merchant-card";
import {
  CheckoutMobileSummaryBar,
  CheckoutOrderSummaryPanel,
} from "./checkout-order-summary-panel";
import { CheckoutPaymentSection } from "./checkout-payment-section";
import {
  CheckoutVerticalStepper,
  type CheckoutVerticalStepperStep,
} from "./checkout-vertical-stepper";
import type {
  CheckoutDeliveryMode,
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutStepId,
} from "./types";

const deliveryFieldNames: CheckoutDeliveryFieldNames<CheckoutDeliveryValues> = {
  recipientName: "recipientName",
  email: "email",
  phone: "phone",
  mode: "mode",
  city: "city",
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  reference: "reference",
  notes: "notes",
};

const defaultDeliveryValues: CheckoutDeliveryValues = {
  recipientName: "",
  email: "",
  phone: "",
  mode: "delivery",
  city: "",
  addressLine1: "",
  addressLine2: "",
  reference: "",
  notes: "",
};

const detailFields: (keyof CheckoutDeliveryValues)[] = [
  "recipientName",
  "email",
  "phone",
];

const sharedDeliveryFields: (keyof CheckoutDeliveryValues)[] = ["mode"];
const deliveryAddressFields: (keyof CheckoutDeliveryValues)[] = [
  "city",
  "addressLine1",
];

type CompletedSteps = Partial<Record<CheckoutStepId, true>>;

const getDeliveryValidationFields = (mode: CheckoutDeliveryMode) =>
  mode === "pickup"
    ? sharedDeliveryFields
    : [...sharedDeliveryFields, ...deliveryAddressFields];

const compactValue = (value: string | undefined) => value?.trim() ?? "";

const getDetailsSummary = (values: CheckoutDeliveryValues) =>
  [compactValue(values.recipientName), compactValue(values.email)].filter(
    Boolean
  );

const getDeliverySummary = (values: CheckoutDeliveryValues) => {
  if (values.mode === "pickup") {
    return [
      "Retiro en local",
      compactValue(values.notes) ||
        "El comercio coordinará el retiro por contacto.",
    ];
  }

  const addressParts = [
    compactValue(values.addressLine1),
    compactValue(values.city),
  ].filter(Boolean);

  return [
    "Entrega a domicilio",
    addressParts.join(", ") || "Dirección pendiente",
  ];
};

interface CheckoutProgressiveFlowProps {
  className?: string;
  deliveryEnabled?: boolean;
  defaultValues?: Partial<CheckoutDeliveryValues>;
  merchant: CheckoutMerchantSummary;
  onSubmit?: (
    values: CheckoutDeliveryValues
  ) => Promise<string | null | void>;
  orderSummary: CheckoutOrderSummary;
  paymentRequired: boolean;
  pickupEnabled?: boolean;
  processorSlot?: ReactNode;
  product: CheckoutProductSummary;
  secureLabel?: string;
  submitLabel?: string;
}

function CheckoutProgressiveFlow({
  className,
  deliveryEnabled = true,
  defaultValues,
  merchant,
  onSubmit,
  orderSummary,
  paymentRequired,
  pickupEnabled = true,
  processorSlot,
  product,
  secureLabel,
  submitLabel = "Confirmar pedido",
}: CheckoutProgressiveFlowProps) {
  const fallbackMode =
    !deliveryEnabled && pickupEnabled ? "pickup" : "delivery";
  const form = useForm<CheckoutDeliveryValues>({
    defaultValues: {
      ...defaultDeliveryValues,
      ...defaultValues,
      mode: defaultValues?.mode ?? fallbackMode,
    },
    mode: "onTouched",
  });

  const [activeStep, setActiveStep] = useState<CheckoutStepId>("details");
  const [completedSteps, setCompletedSteps] = useState<CompletedSteps>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  const formValues = useWatch({
    control: form.control,
  }) as CheckoutDeliveryValues;

  const deliveryMode = (formValues?.mode ?? "delivery") as CheckoutDeliveryMode;
  const canSubmitCheckout =
    Boolean(onSubmit) && (!paymentRequired || merchant.trustState === "verified");

  useEffect(() => {
    if (deliveryEnabled) {
      return;
    }

    if (deliveryMode === "delivery" && pickupEnabled) {
      form.setValue("mode", "pickup");
    }
  }, [deliveryEnabled, deliveryMode, form, pickupEnabled]);

  useEffect(() => {
    if (pickupEnabled) {
      return;
    }

    if (deliveryMode === "pickup" && deliveryEnabled) {
      form.setValue("mode", "delivery");
    }
  }, [deliveryEnabled, deliveryMode, form, pickupEnabled]);

  useEffect(() => {
    if (activeStep !== "details" || completedSteps.details) {
      return;
    }

    const hasCandidateValues = detailFields.every(
      (field) => compactValue(form.getValues(field)).length > 0
    );

    if (!hasCandidateValues) {
      return;
    }

    let cancelled = false;

    form.trigger(detailFields).then((isValid) => {
      if (!isValid || cancelled) {
        return;
      }

      setCompletedSteps((current) => ({ ...current, details: true }));
      setActiveStep("delivery");
    });

    return () => {
      cancelled = true;
    };
  }, [activeStep, completedSteps.details, form]);

  useEffect(() => {
    if (activeStep !== "delivery" || completedSteps.delivery) {
      return;
    }

    const targetFields = getDeliveryValidationFields(deliveryMode);
    const hasCandidateValues = targetFields.every(
      (field) => compactValue(form.getValues(field)).length > 0
    );

    if (!hasCandidateValues) {
      return;
    }

    let cancelled = false;

    form.trigger(targetFields).then((isValid) => {
      if (!isValid || cancelled) {
        return;
      }

      setCompletedSteps((current) => ({
        ...current,
        details: true,
        delivery: true,
      }));
      setActiveStep("payment");
    });

    return () => {
      cancelled = true;
    };
  }, [activeStep, completedSteps.delivery, deliveryMode, form]);

  const steps = useMemo<CheckoutVerticalStepperStep[]>(
    () => [
      {
        id: "details",
        title: "Mis datos",
        isCompleted: !!completedSteps.details,
        isVisible: true,
        summaryLines: getDetailsSummary(form.getValues()),
        content: (
          <CheckoutDetailsStepSection
            control={form.control}
            disabled={isSubmitting}
            names={deliveryFieldNames}
          />
        ),
      },
      {
        id: "delivery",
        title: "Entrega",
        isCompleted: !!completedSteps.delivery,
        isVisible: !!completedSteps.details || activeStep === "delivery",
        summaryLines: getDeliverySummary(form.getValues()),
        content: (
          <CheckoutDeliveryStepSection
            control={form.control}
            deliveryEnabled={deliveryEnabled}
            disabled={isSubmitting}
            names={deliveryFieldNames}
            pickupEnabled={pickupEnabled}
          />
        ),
      },
      {
        id: "payment",
        title: "Pago",
        isCompleted: false,
        isVisible: !!completedSteps.delivery || activeStep === "payment",
        summaryLines: paymentRequired
          ? ["Pago listo para finalizar"]
          : ["Este pedido se coordina sin pago online"],
        content: (
          <CheckoutPaymentSection
            actionSlot={
              canSubmitCheckout ? (
                <div className="space-y-3">
                  {submitError ? (
                    <p className="text-destructive text-sm">{submitError}</p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit((values) => {
                      setSubmitError(null);
                      startSubmitting(async () => {
                        try {
                          const errorMessage = await onSubmit?.(values);
                          setSubmitError(errorMessage ?? null);
                        } catch {
                          setSubmitError("No se pudo continuar con el checkout.");
                        }
                      });
                    })}
                    type="button"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Creando pedido
                      </>
                    ) : (
                      submitLabel
                    )}
                  </Button>
                </div>
              ) : null
            }
            paymentRequired={paymentRequired}
            processorSlot={processorSlot}
            trustState={merchant.trustState}
          />
        ),
      },
    ],
    [
      activeStep,
      completedSteps.delivery,
      completedSteps.details,
      deliveryEnabled,
      form,
      isSubmitting,
      merchant.trustState,
      onSubmit,
      paymentRequired,
      pickupEnabled,
      processorSlot,
      submitLabel,
      submitError,
    ]
  );

  const handleStepSelect = (stepId: CheckoutStepId) => {
    setActiveStep(stepId);

    if (stepId === "details") {
      setCompletedSteps({});
      return;
    }

    if (stepId === "delivery") {
      setCompletedSteps((current) => ({
        details: current.details ? true : undefined,
      }));
    }
  };

  return (
    <Form {...form}>
      <section
        className={cn(
          "min-h-dvh bg-muted/25 px-4 py-4 sm:px-6 sm:py-6 lg:px-8",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:gap-6">
          <CheckoutHeader secureLabel={secureLabel} />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6 pb-24 lg:pb-0">
              <div className="rounded-[1.75rem] border border-border/70 bg-background px-5 py-4 shadow-xs">
                <CheckoutMerchantCard
                  className="px-0 py-0"
                  merchant={merchant}
                />
              </div>
              <div className="rounded-[2rem] border border-border/70 bg-background p-4 shadow-xs sm:p-6">
                <CheckoutVerticalStepper
                  activeStep={activeStep}
                  onStepSelect={handleStepSelect}
                  steps={steps}
                />
              </div>
            </div>
            <CheckoutOrderSummaryPanel
              orderSummary={orderSummary}
              product={product}
            />
          </div>
        </div>
        <CheckoutMobileSummaryBar
          orderSummary={orderSummary}
          product={product}
        />
      </section>
    </Form>
  );
}

export { CheckoutProgressiveFlow };
