"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Form } from "@repo/design-system/components/ui/form";
import { cn } from "@repo/design-system/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCardIcon,
  LoaderCircle,
  ReceiptTextIcon,
} from "lucide-react";
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
import {
  CheckoutPaymentSection,
  type CheckoutPaymentStage,
} from "./checkout-payment-section";
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
type CheckoutLifecycleState =
  | "editing"
  | "creating_order"
  | "order_created"
  | "processing_payment"
  | "confirmed";

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

const createDemoOrderReference = () =>
  `ord_${Math.random().toString(36).slice(2, 10)}`;

const getConfirmationMessage = (
  paymentRequired: boolean,
  merchantName: string
) =>
  paymentRequired
    ? `Registramos tu pedido y simulamos el pago como procesado. ${merchantName} seguirá la confirmación comercial por separado.`
    : `${merchantName} usará tus datos para coordinar la entrega o el retiro.`;

interface CheckoutProgressiveFlowProps {
  className?: string;
  confirmationMessage?: string;
  defaultValues?: Partial<CheckoutDeliveryValues>;
  deliveryEnabled?: boolean;
  isOrderConfirmed?: boolean;
  merchant: CheckoutMerchantSummary;
  onPaymentConfirm?: () => Promise<string | null | undefined>;
  onReset?: () => void;
  onSubmit?: (
    values: CheckoutDeliveryValues
  ) => Promise<string | null | undefined>;
  orderReference?: string | null;
  orderSummary: CheckoutOrderSummary;
  paymentActionLabel?: string;
  paymentRequired: boolean;
  paymentStage?: CheckoutPaymentStage;
  pickupEnabled?: boolean;
  processorSlot?: ReactNode;
  product: CheckoutProductSummary;
  secureLabel?: string;
  submitLabel?: string;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: this shared checkout component intentionally centralizes the sequential form, order, payment, and confirmation states.
function CheckoutProgressiveFlow({
  className,
  confirmationMessage,
  deliveryEnabled = true,
  defaultValues,
  isOrderConfirmed = false,
  merchant,
  onPaymentConfirm,
  onReset,
  onSubmit,
  orderSummary,
  orderReference,
  paymentActionLabel = "Simular pago procesado",
  paymentRequired,
  paymentStage = "idle",
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
  const [lifecycleState, setLifecycleState] =
    useState<CheckoutLifecycleState>("editing");
  const [localOrderReference, setLocalOrderReference] = useState<string | null>(
    orderReference ?? null
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentProcessing, startPaymentProcessing] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  const formValues = useWatch({
    control: form.control,
  }) as CheckoutDeliveryValues;

  const deliveryMode = (formValues?.mode ?? "delivery") as CheckoutDeliveryMode;
  const resolvedOrderReference = orderReference ?? localOrderReference;
  const isConfirmed = isOrderConfirmed || lifecycleState === "confirmed";
  const isLocked = isSubmitting || isPaymentProcessing || isConfirmed;
  const canSubmitCheckout =
    Boolean(onSubmit) &&
    (!paymentRequired || merchant.trustState === "verified");
  const paymentSummaryLines = useMemo(() => {
    if (isConfirmed) {
      return ["Pago simulado como procesado", "Pedido confirmado"];
    }

    if (lifecycleState === "processing_payment") {
      return ["Procesando pago simulado", "Estamos confirmando tu pedido"];
    }

    if (resolvedOrderReference) {
      return ["Pedido creado", "Falta completar el pago"];
    }

    if (!paymentRequired) {
      return ["Este pedido se coordina sin pago online"];
    }

    if (paymentStage === "ready") {
      return ["Pedido creado, completá el pago"];
    }

    if (paymentStage === "initializing") {
      return ["Pedido creado, preparando pago seguro"];
    }

    return ["Vas a continuar al pago seguro"];
  }, [
    isConfirmed,
    lifecycleState,
    paymentRequired,
    paymentStage,
    resolvedOrderReference,
  ]);

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
    if (!orderReference) {
      return;
    }

    setLocalOrderReference(orderReference);
  }, [orderReference]);

  useEffect(() => {
    if (isOrderConfirmed) {
      setLifecycleState("confirmed");
    }
  }, [isOrderConfirmed]);

  useEffect(() => {
    if (resolvedOrderReference && !isConfirmed) {
      setLifecycleState(paymentRequired ? "order_created" : "confirmed");
    }
  }, [isConfirmed, paymentRequired, resolvedOrderReference]);

  const handleContinueDetails = async () => {
    const isValid = await form.trigger(detailFields);

    if (!isValid) {
      return;
    }

    setCompletedSteps((current) => ({ ...current, details: true }));
    setActiveStep("delivery");
  };

  const handleContinueDelivery = async () => {
    const targetFields = getDeliveryValidationFields(deliveryMode);
    const isValid = await form.trigger(targetFields);

    if (!isValid) {
      return;
    }

    setCompletedSteps((current) => ({
      ...current,
      details: true,
      delivery: true,
    }));
    setActiveStep("payment");
  };

  const handleSubmitCheckout = form.handleSubmit((values) => {
    setSubmitError(null);
    setPaymentError(null);
    startSubmitting(async () => {
      setLifecycleState("creating_order");

      try {
        const errorMessage = await onSubmit?.(values);

        if (errorMessage) {
          setSubmitError(errorMessage);
          setLifecycleState("editing");
          return;
        }

        setCompletedSteps((current) => ({
          ...current,
          details: true,
          delivery: true,
        }));
        setLocalOrderReference(
          (current) => current ?? createDemoOrderReference()
        );
        setLifecycleState(paymentRequired ? "order_created" : "confirmed");
      } catch {
        setSubmitError("No se pudo continuar con el checkout.");
        setLifecycleState("editing");
      }
    });
  });

  const handleConfirmPayment = () => {
    setPaymentError(null);
    startPaymentProcessing(async () => {
      setLifecycleState("processing_payment");

      try {
        const errorMessage = await onPaymentConfirm?.();

        if (errorMessage) {
          setPaymentError(errorMessage);
          setLifecycleState("order_created");
          return;
        }

        setLifecycleState("confirmed");
      } catch {
        setPaymentError("No se pudo confirmar el pago.");
        setLifecycleState("order_created");
      }
    });
  };

  const steps: CheckoutVerticalStepperStep[] = [
    {
      id: "details",
      title: "Mis datos",
      isCompleted: !!completedSteps.details,
      isVisible: true,
      summaryLines: getDetailsSummary(form.getValues()),
      content: (
        <div className="space-y-4">
          <CheckoutDetailsStepSection
            control={form.control}
            disabled={isLocked}
            names={deliveryFieldNames}
          />
          <div className="flex justify-end">
            <Button
              disabled={isLocked}
              onClick={handleContinueDetails}
              type="button"
            >
              Continuar a entrega
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "delivery",
      title: "Entrega",
      isCompleted: !!completedSteps.delivery,
      isVisible: !!completedSteps.details || activeStep === "delivery",
      summaryLines: getDeliverySummary(form.getValues()),
      content: (
        <div className="space-y-4">
          <CheckoutDeliveryStepSection
            control={form.control}
            deliveryEnabled={deliveryEnabled}
            disabled={isLocked}
            names={deliveryFieldNames}
            pickupEnabled={pickupEnabled}
          />
          <div className="flex items-center justify-between gap-3">
            <Button
              disabled={isLocked}
              onClick={() => setActiveStep("details")}
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Button>
            <Button
              disabled={isLocked}
              onClick={handleContinueDelivery}
              type="button"
            >
              Continuar a pago
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "payment",
      title: "Pago",
      isCompleted: isConfirmed,
      isVisible: !!completedSteps.delivery || activeStep === "payment",
      summaryLines: paymentSummaryLines,
      content: (
        <CheckoutPaymentSection
          actionSlot={
            canSubmitCheckout ? (
              <div className="space-y-3">
                {submitError ? (
                  <p className="text-destructive text-sm">{submitError}</p>
                ) : null}
                {paymentError ? (
                  <p className="text-destructive text-sm">{paymentError}</p>
                ) : null}
                <Button
                  className="w-full"
                  disabled={
                    isLocked ||
                    (paymentRequired && Boolean(resolvedOrderReference))
                  }
                  onClick={handleSubmitCheckout}
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
                {paymentRequired && resolvedOrderReference ? (
                  <Button
                    className="w-full"
                    disabled={isLocked || paymentStage !== "ready"}
                    onClick={handleConfirmPayment}
                    type="button"
                    variant="outline"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Procesando pago
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="size-4" />
                        {paymentActionLabel}
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            ) : null
          }
          orderReference={resolvedOrderReference}
          paymentRequired={paymentRequired}
          paymentStage={paymentStage}
          processorSlot={processorSlot}
          trustState={merchant.trustState}
        />
      ),
    },
  ];

  const handleStepSelect = (stepId: CheckoutStepId) => {
    if (isLocked) {
      return;
    }

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

  if (isConfirmed) {
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
                <Card className="rounded-[2rem] border-border/70 shadow-xs">
                  <CardHeader className="gap-4 pb-0">
                    <div className="flex size-14 items-center justify-center rounded-3xl bg-emerald-500 text-white">
                      <CheckCircle2 className="size-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                        Pedido confirmado
                      </p>
                      <CardTitle className="text-2xl tracking-[-0.03em]">
                        Checkout finalizado
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <Alert className="rounded-[1.25rem] border-border/70 bg-muted/15">
                      <ReceiptTextIcon className="size-4" />
                      <AlertTitle>Pago procesado</AlertTitle>
                      <AlertDescription>
                        {confirmationMessage ??
                          getConfirmationMessage(
                            paymentRequired,
                            merchant.name
                          )}
                      </AlertDescription>
                    </Alert>
                    {resolvedOrderReference ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-muted/20 px-4 py-3">
                        <p className="font-medium text-foreground text-sm">
                          Referencia del pedido
                        </p>
                        <p className="mt-1 break-all font-mono text-muted-foreground text-sm">
                          {resolvedOrderReference}
                        </p>
                      </div>
                    ) : null}
                    {onReset ? (
                      <Button onClick={onReset} type="button" variant="outline">
                        Crear otro pedido
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
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
