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
  checkoutParaguayCountryOption,
  checkoutParaguayLocationData,
} from "./checkout-paraguay-locations";
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
  CheckoutLocationData,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutSavedAddress,
  CheckoutStepId,
} from "./types";

type CheckoutCopyVariant = "order" | "subscription";

interface CheckoutCopyConfig {
  confirmationEyebrow: string;
  confirmationReferenceLabel: string;
  confirmationTitle: string;
  continueToFulfillmentLabel: string;
  continueToPaymentLabel: string;
  createAnotherLabel: string;
  createdReferenceLabel: string;
  createdStateLabel: string;
  paymentIntroLabel: string;
  paymentPanelLabel: string;
  paymentPendingLabel: string;
  paymentProcessorPlaceholderDescription: string;
  paymentProcessorPlaceholderTitle: string;
  paymentReadyDescription: string;
  paymentStepTitle: string;
  saveDetailsErrorLabel: string;
  saveDetailsLabel: string;
  saveDetailsPendingLabel: string;
  saveDetailsSuccessLabel: string;
}

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

const checkoutCopyByVariant: Record<CheckoutCopyVariant, CheckoutCopyConfig> = {
  order: {
    confirmationEyebrow: "Pedido confirmado",
    confirmationReferenceLabel: "Referencia del pedido",
    confirmationTitle: "Checkout finalizado",
    continueToFulfillmentLabel: "Continuar a entrega",
    continueToPaymentLabel: "Continuar a pago",
    createAnotherLabel: "Crear otro pedido",
    createdReferenceLabel: "Pedido creado",
    createdStateLabel: "Pedido creado",
    paymentIntroLabel: "Vas a continuar al pago seguro",
    paymentPanelLabel: "checkout",
    paymentPendingLabel: "Falta completar el pago",
    paymentProcessorPlaceholderDescription:
      "Se carga dentro del checkout cuando el pedido está listo.",
    paymentProcessorPlaceholderTitle: "Formulario de pago",
    paymentReadyDescription: "Ingresá tu tarjeta en el formulario seguro.",
    paymentStepTitle: "Pago",
    saveDetailsErrorLabel: "No se pudieron guardar tus detalles.",
    saveDetailsLabel: "Guardar detalles",
    saveDetailsPendingLabel: "Guardando detalles",
    saveDetailsSuccessLabel: "Detalles guardados para tu próximo checkout.",
  },
  subscription: {
    confirmationEyebrow: "Suscripción confirmada",
    confirmationReferenceLabel: "Referencia de la suscripción",
    confirmationTitle: "Suscripción finalizada",
    continueToFulfillmentLabel: "Continuar a coordinación",
    continueToPaymentLabel: "Continuar a pago",
    createAnotherLabel: "Crear otra suscripción",
    createdReferenceLabel: "Suscripción creada",
    createdStateLabel: "Suscripción creada",
    paymentIntroLabel: "Vas a continuar al pago seguro de la suscripción",
    paymentPanelLabel: "suscripción",
    paymentPendingLabel: "Falta completar el pago inicial",
    paymentProcessorPlaceholderDescription:
      "Se carga dentro del checkout cuando la suscripción está lista.",
    paymentProcessorPlaceholderTitle: "Formulario de pago recurrente",
    paymentReadyDescription:
      "Ingresá tu tarjeta para activar la suscripción en el formulario seguro.",
    paymentStepTitle: "Pago",
    saveDetailsErrorLabel: "No se pudieron guardar tus detalles.",
    saveDetailsLabel: "Guardar detalles",
    saveDetailsPendingLabel: "Guardando detalles",
    saveDetailsSuccessLabel: "Detalles guardados para tu próximo checkout.",
  },
};

const getConfirmationMessage = (
  paymentRequired: boolean,
  merchantName: string,
  copyVariant: CheckoutCopyVariant
) => {
  if (paymentRequired) {
    return copyVariant === "subscription"
      ? `Registramos tu suscripción y simulamos el pago inicial como procesado. ${merchantName} seguirá la confirmación comercial por separado.`
      : `Registramos tu pedido y simulamos el pago como procesado. ${merchantName} seguirá la confirmación comercial por separado.`;
  }

  return copyVariant === "subscription"
    ? `${merchantName} usará tus datos para coordinar la activación de la suscripción.`
    : `${merchantName} usará tus datos para coordinar la entrega o el retiro.`;
};

export interface CheckoutProgressiveFlowProps {
  allowSavedAddresses?: boolean;
  className?: string;
  confirmationMessage?: string;
  copyVariant?: CheckoutCopyVariant;
  defaultValues?: Partial<CheckoutDeliveryValues>;
  deliveryEnabled?: boolean;
  isOrderConfirmed?: boolean;
  locationData?: CheckoutLocationData;
  merchant: CheckoutMerchantSummary;
  onPaymentConfirm?: () => Promise<string | null | undefined>;
  onReset?: () => void;
  onSaveDetails?: (
    values: CheckoutDeliveryValues & { quantity: number }
  ) => Promise<string | null | undefined>;
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
  skipFulfillmentStep?: boolean;
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
  copyVariant = "order",
  deliveryEnabled = true,
  defaultValues,
  isOrderConfirmed = false,
  locationData = checkoutParaguayLocationData,
  merchant,
  onPaymentConfirm,
  onReset,
  onSaveDetails,
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
  skipFulfillmentStep = false,
  submitLabel = "Confirmar pedido",
  user,
}: CheckoutProgressiveFlowProps) {
  const copy = checkoutCopyByVariant[copyVariant];
  const defaultCountryId =
    defaultValues?.countryId ??
    locationData.countries[0]?.value ??
    checkoutParaguayCountryOption.value;
  const fallbackMode =
    (!deliveryEnabled && pickupEnabled) || skipFulfillmentStep
      ? "pickup"
      : "delivery";
  const form = useForm<CheckoutDeliveryValues>({
    defaultValues: {
      ...defaultDeliveryValues,
      ...defaultValues,
      countryId: defaultCountryId,
      mode: skipFulfillmentStep
        ? "pickup"
        : (defaultValues?.mode ?? fallbackMode),
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
  const [saveDetailsError, setSaveDetailsError] = useState<string | null>(null);
  const [saveDetailsState, setSaveDetailsState] = useState<
    "idle" | "error" | "saved"
  >("idle");
  const [isSavingDetails, startSavingDetails] = useTransition();
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
    () =>
      savedAddresses.find((address) => address.isDefault) ??
      savedAddresses[0] ??
      null,
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
      return ["Pago simulado como procesado", copy.confirmationEyebrow];
    }

    if (lifecycleState === "processing_payment") {
      return [
        "Procesando pago simulado",
        `Estamos confirmando ${copyVariant === "subscription" ? "tu suscripción" : "tu pedido"}`,
      ];
    }

    if (resolvedOrderReference) {
      return [copy.createdStateLabel, copy.paymentPendingLabel];
    }

    if (!paymentRequired) {
      return [
        copyVariant === "subscription"
          ? "Esta suscripción se coordina sin pago online"
          : "Este pedido se coordina sin pago online",
      ];
    }

    if (paymentStage === "ready") {
      return [`${copy.createdStateLabel}, completá el pago`];
    }

    if (paymentStage === "initializing") {
      return [`${copy.createdStateLabel}, preparando pago seguro`];
    }

    return [copy.paymentIntroLabel];
  }, [
    copy.confirmationEyebrow,
    copy.createdStateLabel,
    copy.paymentIntroLabel,
    copy.paymentPendingLabel,
    copyVariant,
    isConfirmed,
    lifecycleState,
    paymentRequired,
    paymentStage,
    resolvedOrderReference,
  ]);

  useEffect(() => {
    if (!skipFulfillmentStep) {
      return;
    }

    if (deliveryMode !== "pickup") {
      form.setValue("mode", "pickup");
    }
  }, [deliveryMode, form, skipFulfillmentStep]);

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
      (formValues.streetLine2 ?? "") ===
        (selectedSavedAddress.streetLine2 ?? "") &&
      (formValues.postalCode ?? "") ===
        (selectedSavedAddress.postalCode ?? "") &&
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

    setCompletedSteps((current) =>
      skipFulfillmentStep
        ? { ...current, details: true, delivery: true }
        : { ...current, details: true }
    );
    setActiveStep(skipFulfillmentStep ? "payment" : "delivery");
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

  const handleSaveDetails = () => {
    if (!onSaveDetails) {
      return;
    }

    setSaveDetailsError(null);
    setSaveDetailsState("idle");
    startSavingDetails(async () => {
      try {
        const errorMessage = await onSaveDetails({
          ...form.getValues(),
          quantity,
        });

        if (errorMessage) {
          setSaveDetailsError(errorMessage);
          setSaveDetailsState("error");
          return;
        }

        setSaveDetailsState("saved");
      } catch {
        setSaveDetailsError(copy.saveDetailsErrorLabel);
        setSaveDetailsState("error");
      }
    });
  };

  const detailStep: CheckoutVerticalStepperStep = {
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
            {skipFulfillmentStep
              ? copy.continueToPaymentLabel
              : copy.continueToFulfillmentLabel}
          </Button>
        </div>
      </div>
    ),
  };

  const deliveryStep: CheckoutVerticalStepperStep = {
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
            {copy.continueToPaymentLabel}
          </Button>
        </div>
      </div>
    ),
  };

  const paymentStep: CheckoutVerticalStepperStep = {
    id: "payment",
    title: copy.paymentStepTitle,
    isCompleted: isConfirmed,
    isVisible:
      skipFulfillmentStep ||
      !!completedSteps.delivery ||
      activeStep === "payment",
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
        checkoutLabel={copy.paymentPanelLabel}
        completedLabel={
          copyVariant === "subscription" ? "suscripción" : "pedido"
        }
        orderReference={resolvedOrderReference}
        paymentReadyDescription={copy.paymentReadyDescription}
        paymentRequired={paymentRequired}
        paymentStage={paymentStage}
        processorPlaceholderDescription={
          copy.paymentProcessorPlaceholderDescription
        }
        processorPlaceholderTitle={copy.paymentProcessorPlaceholderTitle}
        processorSlot={processorSlot}
        referenceLabel={copy.createdReferenceLabel}
        trustState={merchant.trustState}
      />
    ),
  };

  const steps: CheckoutVerticalStepperStep[] = skipFulfillmentStep
    ? [detailStep, paymentStep]
    : [detailStep, deliveryStep, paymentStep];

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
      if (skipFulfillmentStep) {
        setCompletedSteps((current) => ({
          details: current.details ? true : undefined,
          delivery: true,
        }));
        return;
      }

      setCompletedSteps((current) => ({
        details: current.details ? true : undefined,
      }));
      return;
    }

    if (stepId === "payment") {
      setCompletedSteps((current) => ({
        details: current.details ? true : undefined,
        delivery: skipFulfillmentStep || current.delivery ? true : undefined,
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
                        {copy.confirmationEyebrow}
                      </p>
                      <CardTitle className="text-2xl tracking-[-0.03em]">
                        {copy.confirmationTitle}
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
                            merchant.name,
                            copyVariant
                          )}
                      </AlertDescription>
                    </Alert>
                    {resolvedOrderReference ? (
                      <div className="rounded-[1.25rem] border border-border/70 bg-muted/20 px-4 py-3">
                        <p className="font-medium text-foreground text-sm">
                          {copy.confirmationReferenceLabel}
                        </p>
                        <p className="mt-1 break-all font-mono text-muted-foreground text-sm">
                          {resolvedOrderReference}
                        </p>
                      </div>
                    ) : null}
                    {saveDetailsState === "saved" ? (
                      <p className="font-medium text-emerald-700 text-sm">
                        {copy.saveDetailsSuccessLabel}
                      </p>
                    ) : null}
                    {saveDetailsState === "error" ? (
                      <p className="font-medium text-destructive text-sm">
                        {saveDetailsError ?? copy.saveDetailsErrorLabel}
                      </p>
                    ) : null}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {onSaveDetails ? (
                        <Button
                          disabled={isSavingDetails}
                          onClick={handleSaveDetails}
                          type="button"
                        >
                          {isSavingDetails ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" />
                              {copy.saveDetailsPendingLabel}
                            </>
                          ) : (
                            copy.saveDetailsLabel
                          )}
                        </Button>
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
                          {copy.createAnotherLabel}
                        </Button>
                      ) : null}
                    </div>
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
