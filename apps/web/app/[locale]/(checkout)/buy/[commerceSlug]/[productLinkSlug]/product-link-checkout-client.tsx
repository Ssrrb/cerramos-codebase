"use client";

import { CheckoutProgressiveFlow } from "@repo/design-system/components/checkout/checkout-progressive-flow";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "@repo/design-system/components/checkout/types";
import { Button } from "@repo/design-system/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

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
}

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
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(
    null
  );

  if (createdOrder) {
    return (
      <section className="min-h-dvh bg-muted/25 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/70 bg-background p-8 shadow-xs">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h1 className="font-semibold text-2xl text-foreground">
                  Pedido creado
                </h1>
                <p className="text-muted-foreground text-sm">
                  Tu pedido quedó registrado dentro de Cerramos.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
              <p className="font-medium text-foreground text-sm">
                ID del pedido
              </p>
              <p className="mt-1 break-all font-mono text-muted-foreground text-sm">
                {createdOrder.orderId}
              </p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {createdOrder.paymentRequired
                ? "El pedido quedó creado con un intento de pago pendiente. El siguiente paso es conectar el componente embebido del proveedor."
                : "El comercio usará tus datos para coordinar la entrega o el retiro."}
            </p>
            <Button
              onClick={() => setCreatedOrder(null)}
              type="button"
              variant="outline"
            >
              Crear otro pedido
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <CheckoutProgressiveFlow
      defaultValues={{
        mode: deliveryEnabled ? "delivery" : "pickup",
      }}
      deliveryEnabled={deliveryEnabled}
      merchant={merchant}
      onSubmit={async (values: CheckoutDeliveryValues) => {
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
          const errorPayload = payload as
            | {
                error?: string;
                fieldErrors?: Record<string, string[] | undefined>;
              }
            | null;

          if (payload && "fieldErrors" in payload) {
            const firstError = Object.values(payload.fieldErrors ?? {}).find(
              (messages) => messages?.[0]
            )?.[0];

            return (
              firstError ??
              errorPayload?.error ??
              "No se pudo crear el pedido."
            );
          }

          return errorPayload?.error ?? "No se pudo crear el pedido.";
        }

        setCreatedOrder(payload as CreateOrderResponse);
        return null;
      }}
      orderSummary={orderSummary}
      paymentRequired={paymentRequired}
      pickupEnabled={pickupEnabled}
      product={product}
      submitLabel={paymentRequired ? "Crear pedido" : "Confirmar pedido"}
    />
  );
};
