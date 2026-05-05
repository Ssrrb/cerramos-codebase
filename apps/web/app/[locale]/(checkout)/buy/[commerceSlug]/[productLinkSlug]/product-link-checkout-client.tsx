"use client";

import { CheckoutPage } from "@repo/design-system/components/checkout/checkout-page";
import type { CheckoutPaymentStage } from "@repo/design-system/components/checkout/checkout-payment-section";
import { CheckoutUpayCardLoader } from "@repo/design-system/components/checkout/checkout-upay-card-loader";
import type {
  CheckoutDeliveryValues,
  CheckoutLocationData,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutSavedAddress,
} from "@repo/design-system/components/checkout/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { ReceiptTextIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CheckoutAuthAction,
  type CheckoutAuthUser,
} from "./checkout-auth-action";

interface ProductLinkCheckoutClientProps {
  commerceSlug: string;
  copyVariant?: "order" | "subscription";
  deliveryEnabled?: boolean;
  fulfillmentMode?: "delivery" | "delivery_or_pickup" | "none" | "pickup";
  googleEnabled?: boolean;
  initialAuthUser?: CheckoutAuthUser | null;
  initialLocationData: CheckoutLocationData;
  initialSavedAddresses?: CheckoutSavedAddress[];
  merchant: CheckoutMerchantSummary;
  orderSummary: CheckoutOrderSummary;
  paymentRequired: boolean;
  pickupEnabled?: boolean;
  product: CheckoutProductSummary;
  productLinkSlug: string;
  skipFulfillmentStep?: boolean;
}

interface CreateOrderResponse {
  orderId: string;
  paymentIntentId: string | null;
  paymentRequired: boolean;
  success: true;
  upayFormId: string | null;
}

const resolveFulfillmentMode = ({
  deliveryEnabled,
  fulfillmentMode,
  pickupEnabled,
}: Pick<
  ProductLinkCheckoutClientProps,
  "deliveryEnabled" | "fulfillmentMode" | "pickupEnabled"
>) => {
  if (fulfillmentMode) {
    return fulfillmentMode;
  }

  if (deliveryEnabled && pickupEnabled) {
    return "delivery_or_pickup";
  }

  if (deliveryEnabled) {
    return "delivery";
  }

  return pickupEnabled ? "pickup" : "none";
};

const getConfirmationMessage = (
  copyVariant: ProductLinkCheckoutClientProps["copyVariant"],
  skipFulfillmentStep: boolean
) => {
  if (copyVariant === "subscription") {
    return "Registramos tu suscripción y el pago inicial se completa dentro de Cerramos. La activación comercial seguirá por separado.";
  }

  if (skipFulfillmentStep) {
    return "Registramos tu reserva y el pago se completa dentro de Cerramos. La coordinación comercial seguirá por separado.";
  }

  return "Registramos tu pedido y el pago se completa dentro de Cerramos. La confirmación comercial seguirá por separado.";
};

const saveCheckoutDetails = async (
  values: CheckoutDeliveryValues & { quantity: number }
) => {
  const response = await fetch("/api/checkout/saved-details", {
    body: JSON.stringify(values),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  } | null;

  if (response.ok) {
    return null;
  }

  if (payload?.fieldErrors) {
    const firstError = Object.values(payload.fieldErrors).find(
      (messages) => messages?.[0]
    )?.[0];

    if (firstError) {
      return firstError;
    }
  }

  return payload?.error ?? "No se pudieron guardar tus detalles.";
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const ProductLinkCheckoutClient = ({
  commerceSlug,
  copyVariant = "order",
  deliveryEnabled: deliveryEnabledProp,
  fulfillmentMode,
  googleEnabled = false,
  initialLocationData,
  initialAuthUser = null,
  initialSavedAddresses = [],
  merchant,
  orderSummary,
  paymentRequired,
  pickupEnabled: pickupEnabledProp,
  product,
  productLinkSlug,
  skipFulfillmentStep = false,
}: ProductLinkCheckoutClientProps) => {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] =
    useState<CheckoutPaymentStage>("idle");
  const [upayFormId, setUpayFormId] = useState<string | null>(null);

  useEffect(() => {
    if (paymentStage !== "initializing" || !upayFormId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPaymentStage("ready");
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [paymentStage, upayFormId]);

  const paymentProcessorSlot = useMemo(() => {
    if (!(paymentRequired && orderReference)) {
      return undefined;
    }

    return (
      <div className="space-y-3">
        <Alert className="rounded-[1.25rem] border-border/70 bg-muted/15">
          <ReceiptTextIcon className="size-4" />
          <AlertTitle>Pedido registrado en Cerramos</AlertTitle>
          <AlertDescription>
            Guardamos tu pedido y ahora el pago sigue dentro de este checkout.
            La confirmación comercial del pedido llegará por separado.
          </AlertDescription>
        </Alert>
        <CheckoutUpayCardLoader formId={upayFormId} />
      </div>
    );
  }, [orderReference, paymentRequired, upayFormId]);

  const resolvedFulfillmentMode = resolveFulfillmentMode({
    deliveryEnabled: deliveryEnabledProp,
    fulfillmentMode,
    pickupEnabled: pickupEnabledProp,
  });
  const deliveryEnabled =
    resolvedFulfillmentMode === "delivery" ||
    resolvedFulfillmentMode === "delivery_or_pickup";
  const pickupEnabled =
    resolvedFulfillmentMode === "pickup" ||
    resolvedFulfillmentMode === "delivery_or_pickup";
  const confirmationMessage = getConfirmationMessage(
    copyVariant,
    skipFulfillmentStep
  );

  return (
    <CheckoutPage
      accountAction={
        <CheckoutAuthAction
          googleEnabled={googleEnabled}
          initialUser={initialAuthUser}
        />
      }
      allowSavedAddresses={Boolean(initialAuthUser)}
      confirmationMessage={confirmationMessage}
      copyVariant={copyVariant}
      defaultValues={{
        email: initialAuthUser?.email ?? "",
        countryId: initialLocationData.countries[0]?.value ?? "",
        mode: deliveryEnabled ? "delivery" : "pickup",
        recipientName: initialAuthUser?.name ?? "",
        phone: initialAuthUser?.phone ?? "",
      }}
      deliveryEnabled={deliveryEnabled}
      footerContent="Powered by Cheki"
      isOrderConfirmed={isOrderConfirmed}
      locationData={initialLocationData}
      merchant={merchant}
      onPaymentConfirm={async () => {
        await wait(1000);
        setIsOrderConfirmed(true);
        return null;
      }}
      onReset={() => {
        setIsOrderConfirmed(false);
        setOrderReference(null);
        setPaymentStage("idle");
        setUpayFormId(null);
      }}
      onSaveDetails={initialAuthUser ? saveCheckoutDetails : undefined}
      onSubmit={
        orderReference
          ? undefined
          : async (values: CheckoutDeliveryValues & { quantity: number }) => {
              const response = await fetch(
                `/api/buy/${commerceSlug}/${productLinkSlug}/orders`,
                {
                  body: JSON.stringify(values),
                  headers: {
                    "content-type": "application/json",
                  },
                  method: "POST",
                }
              );

              const payload = (await response.json().catch(() => null)) as
                | {
                    error?: string;
                    fieldErrors?: Record<string, string[] | undefined>;
                  }
                | CreateOrderResponse
                | null;

              if (!response.ok) {
                const errorPayload = payload as {
                  error?: string;
                  fieldErrors?: Record<string, string[] | undefined>;
                } | null;

                if (payload && "fieldErrors" in payload) {
                  const firstError = Object.values(
                    payload.fieldErrors ?? {}
                  ).find((messages) => messages?.[0])?.[0];

                  return (
                    firstError ??
                    errorPayload?.error ??
                    "No se pudo crear el pedido."
                  );
                }

                return errorPayload?.error ?? "No se pudo crear el pedido.";
              }

              const order = payload as CreateOrderResponse;
              const resolvedUpayFormId =
                order.upayFormId ?? order.paymentIntentId ?? null;

              setOrderReference(order.orderId);

              if (!order.paymentRequired) {
                setIsOrderConfirmed(true);
                return null;
              }

              setUpayFormId(resolvedUpayFormId);
              setPaymentStage("initializing");
              return null;
            }
      }
      orderReference={orderReference}
      orderSummary={orderSummary}
      paymentRequired={paymentRequired}
      paymentStage={paymentStage}
      pickupEnabled={pickupEnabled}
      processorSlot={paymentProcessorSlot}
      product={product}
      savedAddresses={initialSavedAddresses}
      skipFulfillmentStep={skipFulfillmentStep}
      submitLabel={paymentRequired ? "Crear pedido" : "Confirmar pedido"}
    />
  );
};
