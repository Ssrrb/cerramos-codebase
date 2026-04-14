"use client";

import type { CheckoutPaymentStage } from "@repo/design-system/components/checkout/checkout-payment-section";
import { CheckoutPage } from "@repo/design-system/components/checkout/checkout-page";
import { CheckoutUpayCardLoader } from "@repo/design-system/components/checkout/checkout-upay-card-loader";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "@repo/design-system/components/checkout/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { ReceiptTextIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ProductLinkCheckoutClientProps {
  commerceSlug: string;
  deliveryEnabled: boolean;
  merchant: CheckoutMerchantSummary;
  orderSummary: CheckoutOrderSummary;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  product: CheckoutProductSummary;
  productLinkSlug: string;
}

interface CreateOrderResponse {
  orderId: string;
  paymentIntentId: string | null;
  paymentRequired: boolean;
  success: true;
  upayFormId: string | null;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export const ProductLinkCheckoutClient = ({
  commerceSlug,
  deliveryEnabled,
  merchant,
  orderSummary,
  paymentRequired,
  pickupEnabled,
  product,
  productLinkSlug,
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
    if (!paymentRequired || !orderReference) {
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
        <div className="rounded-[1.25rem] border border-border/70 bg-background px-4 py-3">
          <p className="font-medium text-foreground text-sm">Referencia</p>
          <p className="mt-1 break-all font-mono text-muted-foreground text-sm">
            {orderReference}
          </p>
        </div>
        <CheckoutUpayCardLoader formId={upayFormId} />
      </div>
    );
  }, [orderReference, paymentRequired, upayFormId]);

  return (
    <CheckoutPage
      confirmationMessage="Registramos tu pedido y el pago se completa dentro de Cerramos. La confirmación comercial seguirá por separado."
      defaultValues={{
        mode: deliveryEnabled ? "delivery" : "pickup",
      }}
      deliveryEnabled={deliveryEnabled}
      footerContent="Powered by Cheki"
      isOrderConfirmed={isOrderConfirmed}
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
      submitLabel={paymentRequired ? "Crear pedido" : "Confirmar pedido"}
    />
  );
};
