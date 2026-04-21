"use client";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCardIcon,
  LoaderCircle,
  ReceiptTextIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form } from "../ui/form";
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
  checkoutParaguayLocationData,
  checkoutParaguayCountryOption,
} from "./checkout-paraguay-locations";
import {
  CheckoutVerticalStepper,
  type CheckoutVerticalStepperStep,
} from "./checkout-vertical-stepper";
import type {
  CheckoutDeliveryMode,
  CheckoutDeliveryValues,
  CheckoutLocationData,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutSavedAddress,
  CheckoutStepId,
} from "./types";

const deliveryFieldNames: CheckoutDeliveryFieldNames<CheckoutDeliveryValues> = {
  recipientName: "recipientName",
  email: "email",
  phone: "phone",
  mode: "mode",
  countryId: "countryId",
  stateId: "stateId",
  cityId: "cityId",
  customerAddressId: "customerAddressId",
  streetLine1: "streetLine1",
  streetLine2: "streetLine2",
  postalCode: "postalCode",
  referenceNote: "referenceNote",
  notes: "notes",
  saveAddress: "saveAddress",
  saveAsDefault: "saveAsDefault",
};

const defaultDeliveryValues: CheckoutDeliveryValues = {
  recipientName: "",
  email: "",
  phone: "",
  mode: "delivery",
  countryId: checkoutParaguayCountryOption.value,
  stateId: "",
  cityId: "",
  customerAddressId: "",
  streetLine1: "",
  streetLine2: "",
  referenceNote: "",
  postalCode: "",
  notes: "",
  saveAddress: false,
  saveAsDefault: false,
};

const findLocationLabel = (
  value: string | undefined,
  options: Array<{ label: string; value: string }>
) => options.find((option) => option.value === value)?.label;

const detailFields: (keyof CheckoutDeliveryValues)[] = [
  "recipientName",
  "email",
  "phone",
];

const sharedDeliveryFields: (keyof CheckoutDeliveryValues)[] = ["mode"];
const deliveryAddressFields: (keyof CheckoutDeliveryValues)[] = [
  "countryId",
  "stateId",
  "cityId",
  "streetLine1",
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

const getDeliverySummary = (
  values: CheckoutDeliveryValues,
  locationData: CheckoutLocationData
) => {
  if (values.mode === "pickup") {
    return [
      "Retiro en local",
      compactValue(values.notes) ||
        "El comercio coordinará el retiro por contacto.",
    ];
  }

  const addressParts = [
    compactValue(values.streetLine1),
    findLocationLabel(values.cityId, locationData.cities) ??
      compactValue(values.cityId),
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

export interface CheckoutProgressiveFlowProps {
  allowSavedAddresses?: boolean;
  className?: string;
  confirmationMessage?: string;
  defaultValues?: Partial<CheckoutDeliveryValues>;
  deliveryEnabled?: boolean;
  isOrderConfirmed?: boolean;
  locationData?: CheckoutLocationData;
  merchant: CheckoutMerchantSummary;
  onPaymentConfirm?: () => Promise<string | null | undefined>;
  onReset?: () => void;
  onSubmit?: (
    values: CheckoutDeliveryValues & { quantity: number }
  ) => Promise<string | null | undefined>;
  orderReference?: string | null;
  orderSummary: CheckoutOrderSummary;
  paymentActionLabel?: string;
  paymentRequired: boolean;
  paymentStage?: CheckoutPaymentStage;
  pickupEnabled?: boolean;
  processorSlot?: ReactNode;
  product: CheckoutProductSummary;
  savedAddresses?: CheckoutSavedAddress[];
  secureLabel?: string;
  showHeader?: boolean;
  submitLabel?: string;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: this shared checkout component intentionally centralizes the sequential form, order, payment, and confirmation states.
function CheckoutProgressiveFlow({
  allowSavedAddresses = false,
  className,
  confirmationMessage,
  deliveryEnabled = true,
  defaultValues,
  isOrderConfirmed = false,
  locationData = checkoutParaguayLocationData,
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
  savedAddresses = [],
  secureLabel,
  showHeader = true,
  submitLabel = "Confirmar pedido",
  user,
}: CheckoutProgressiveFlowProps) {
  const defaultCountryId =
    defaultValues?.countryId ??
    locationData.countries[0]?.value ??
    checkoutParaguayCountryOption.value;
  const fallbackMode =
    !deliveryEnabled && pickupEnabled ? "pickup" : "delivery";
  const form = useForm<CheckoutDeliveryValues>({
    defaultValues: {
      ...defaultDeliveryValues,
      ...defaultValues,
      countryId: defaultCountryId,
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
  const [quantity, setQuantity] = useState(() =>
    Math.max(1, Math.min(product.quantity, Math.max(product.availableStock, 1)))
  );
  const initialQuantity = Math.max(
    1,
    Math.min(product.quantity, Math.max(product.availableStock, 1))
  );

  const formValues = useWatch({
    control: form.control,
  }) as CheckoutDeliveryValues;
  const lastAppliedSavedAddressId = useRef<string | null>(null);

  const deliveryMode = (formValues?.mode ?? "delivery") as CheckoutDeliveryMode;
  const preferredSavedAddress = useMemo(
    () => savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0] ?? null,
    [savedAddresses]
  );
  const selectedSavedAddress = useMemo(
    () =>
      savedAddresses.find(
        (address) => address.id === (formValues?.customerAddressId ?? "").trim()
      ) ?? null,
    [formValues?.customerAddressId, savedAddresses]
  );
  const resolvedOrderReference = orderReference ?? localOrderReference;
  const isConfirmed = isOrderConfirmed || lifecycleState === "confirmed";
  const isLocked = isSubmitting || isPaymentProcessing || isConfirmed;
  const isOutOfStock = product.availableStock <= 0;
  const canSubmitCheckout =
    Boolean(onSubmit) &&
    (!paymentRequired || merchant.trustState === "verified") &&
    !isOutOfStock;
  const resolvedProduct = useMemo(
    () => ({
      ...product,
      quantity,
    }),
    [product, quantity]
  );
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
    if (deliveryMode !== "pickup") {
      return;
    }

    if (
      form.getValues("customerAddressId") ||
      form.getValues("saveAddress") ||
      form.getValues("saveAsDefault")
    ) {
      form.setValue("customerAddressId", "");
      form.setValue("saveAddress", false);
      form.setValue("saveAsDefault", false);
    }
  }, [deliveryMode, form]);

  useEffect(() => {
    if (deliveryMode !== "delivery" || form.getValues("customerAddressId")) {
      return;
    }

    if (!preferredSavedAddress) {
      lastAppliedSavedAddressId.current = null;
      return;
    }

    const hasStartedAddressEntry = [
      form.getValues("stateId"),
      form.getValues("cityId"),
      form.getValues("streetLine1"),
      form.getValues("streetLine2"),
      form.getValues("postalCode"),
      form.getValues("referenceNote"),
    ].some((value) => value?.trim());

    if (hasStartedAddressEntry) {
      return;
    }

    form.setValue("customerAddressId", preferredSavedAddress.id, {
      shouldDirty: true,
    });
  }, [deliveryMode, form, preferredSavedAddress]);

  useEffect(() => {
    if (!selectedSavedAddress) {
      lastAppliedSavedAddressId.current = null;
      return;
    }

    if (lastAppliedSavedAddressId.current === selectedSavedAddress.id) {
      return;
    }

    form.setValue("countryId", selectedSavedAddress.countryId, {
      shouldDirty: true,
    });
    form.setValue("stateId", selectedSavedAddress.stateId, {
      shouldDirty: true,
    });
    form.setValue("cityId", selectedSavedAddress.cityId, {
      shouldDirty: true,
    });
    form.setValue("streetLine1", selectedSavedAddress.streetLine1, {
      shouldDirty: true,
    });
    form.setValue("streetLine2", selectedSavedAddress.streetLine2 ?? "", {
      shouldDirty: true,
    });
    form.setValue("postalCode", selectedSavedAddress.postalCode ?? "", {
      shouldDirty: true,
    });
    form.setValue("referenceNote", selectedSavedAddress.referenceNote ?? "", {
      shouldDirty: true,
    });
    form.setValue("saveAddress", false, { shouldDirty: true });
    form.setValue("saveAsDefault", selectedSavedAddress.isDefault, {
      shouldDirty: true,
    });
    lastAppliedSavedAddressId.current = selectedSavedAddress.id;
  }, [form, selectedSavedAddress]);

  useEffect(() => {
    if (!selectedSavedAddress) {
      return;
    }

    const addressMatchesSelection =
      formValues.countryId === selectedSavedAddress.countryId &&
      formValues.stateId === selectedSavedAddress.stateId &&
      formValues.cityId === selectedSavedAddress.cityId &&
      formValues.streetLine1 === selectedSavedAddress.streetLine1 &&
      (formValues.streetLine2 ?? "") === (selectedSavedAddress.streetLine2 ?? "") &&
      (formValues.postalCode ?? "") === (selectedSavedAddress.postalCode ?? "") &&
      (formValues.referenceNote ?? "") ===
        (selectedSavedAddress.referenceNote ?? "");

    if (addressMatchesSelection) {
      return;
    }

    form.setValue("customerAddressId", "", { shouldDirty: true });
    form.setValue("saveAsDefault", false, { shouldDirty: true });
    lastAppliedSavedAddressId.current = null;
  }, [
    form,
    formValues.cityId,
    formValues.countryId,
    formValues.postalCode,
    formValues.referenceNote,
    formValues.stateId,
    formValues.streetLine1,
    formValues.streetLine2,
    selectedSavedAddress,
  ]);

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
    setQuantity((current) =>
      Math.max(1, Math.min(current, Math.max(product.availableStock, 1)))
    );
  }, [product.availableStock]);

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
        const errorMessage = await onSubmit?.({ ...values, quantity });

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
              className="min-h-11 w-full sm:w-auto"
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
      summaryLines: getDeliverySummary(form.getValues(), locationData),
      content: (
        <div className="space-y-4">
          <CheckoutDeliveryStepSection
            allowSavedAddresses={allowSavedAddresses}
            control={form.control}
            deliveryEnabled={deliveryEnabled}
            disabled={isLocked}
            locationData={locationData}
            names={deliveryFieldNames}
            pickupEnabled={pickupEnabled}
            savedAddresses={savedAddresses}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              className="min-h-11 w-full sm:w-auto"
              disabled={isLocked}
              onClick={() => setActiveStep("details")}
              type="button"
              variant="ghost"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Button>
            <Button
              className="min-h-11 w-full sm:w-auto"
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
                  className="min-h-11 w-full"
                  disabled={
                    isLocked ||
                    isOutOfStock ||
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
                    className="min-h-11 w-full"
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
                {isOutOfStock ? (
                  <p className="text-muted-foreground text-sm">
                    Este producto se quedó sin stock y no puede continuar al
                    checkout.
                  </p>
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
            "min-h-dvh bg-muted/25 px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-6",
            className
          )}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:gap-4 lg:gap-6">
            {showHeader ? (
              <CheckoutHeader secureLabel={secureLabel} user={user} />
            ) : null}
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
              <div className="space-y-4 pb-24 sm:space-y-5 lg:space-y-6 lg:pb-0">
                <div className="rounded-[1.75rem] border border-border/70 bg-background px-4 py-3 shadow-xs sm:px-5 sm:py-4">
                  <CheckoutMerchantCard
                    className="px-0 py-0"
                    merchant={merchant}
                  />
                </div>
                <Card className="rounded-[2rem] border-border/70 shadow-xs">
                  <CardHeader className="gap-4 px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
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
                  <CardContent className="space-y-4 px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
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
                      <Button
                        onClick={() => {
                          setQuantity(initialQuantity);
                          onReset?.();
                        }}
                        type="button"
                        variant="outline"
                      >
                        Crear otro pedido
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
              <CheckoutOrderSummaryPanel
                onQuantityChange={setQuantity}
                orderSummary={orderSummary}
                product={resolvedProduct}
              />
            </div>
          </div>
          <CheckoutMobileSummaryBar
            onQuantityChange={setQuantity}
            orderSummary={orderSummary}
            product={resolvedProduct}
          />
        </section>
      </Form>
    );
  }

  return (
    <Form {...form}>
      <section
        className={cn(
          "min-h-dvh bg-muted/25 px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-6",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:gap-4 lg:gap-6">
          {showHeader ? (
            <CheckoutHeader secureLabel={secureLabel} user={user} />
          ) : null}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
            <div className="space-y-4 pb-24 sm:space-y-5 md:pb-28 lg:space-y-6 lg:pb-0">
              <div className="rounded-[1.75rem] border border-border/70 bg-background px-4 py-3 shadow-xs sm:px-5 sm:py-4">
                <CheckoutMerchantCard
                  className="px-0 py-0"
                  merchant={merchant}
                />
              </div>
              <div className="rounded-[2rem] border border-border/70 bg-background p-3 shadow-xs sm:p-5 lg:p-6">
                <CheckoutVerticalStepper
                  activeStep={activeStep}
                  onStepSelect={handleStepSelect}
                  steps={steps}
                />
              </div>
            </div>
            <CheckoutOrderSummaryPanel
              onQuantityChange={setQuantity}
              orderSummary={orderSummary}
              product={resolvedProduct}
            />
          </div>
        </div>
        <CheckoutMobileSummaryBar
          onQuantityChange={setQuantity}
          orderSummary={orderSummary}
          product={resolvedProduct}
        />
      </section>
    </Form>
  );
}

export { CheckoutProgressiveFlow };
