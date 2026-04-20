import type { CheckoutPaymentStage } from "@repo/design-system/components/checkout/checkout-payment-section";
import { CheckoutProgressiveFlow } from "@repo/design-system/components/checkout/checkout-progressive-flow";
import { CheckoutUpayCardLoader } from "@repo/design-system/components/checkout/checkout-upay-card-loader";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "@repo/design-system/components/checkout/types";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

// TODO: remove this legacy Paraguay resolver after new submits
// the current state refactor should fetch state then city ids instead of city/barrio.
const merchantVerified: CheckoutMerchantSummary = {
  name: "Casa Nube",
  avatarUrl:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80",
  trustState: "verified",
};

const merchantPending: CheckoutMerchantSummary = {
  name: "Mercadito San Roque",
  avatarUrl:
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=300&q=80",
  trustState: "pending_review",
};

const product: CheckoutProductSummary = {
  availableStock: 6,
  name: "Set matero de acero con bombilla y funda térmica",
  description:
    "Incluye termo de 1 litro, mate forrado y funda liviana para acompañarte todos los días sin sumar pasos innecesarios al checkout.",
  imageUrl:
    "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80",
  priceLabel: "Gs. 145.000",
  quantity: 1,
  unitPrice: 145_000,
};

const defaultDeliveryValues: CheckoutDeliveryValues = {
  recipientName: "Camila Ferreira",
  email: "camila@cerramos.com",
  phone: "0981 123 456",
  mode: "delivery",
  city: "Asunción",
  addressLine1: "Av. España 742 casi Perú",
  addressLine2: "Barrio Jara",
  reference: "Portón negro frente a la farmacia",
  notes: "",
};

const orderSummary: CheckoutOrderSummary = {
  title: "Tu pedido",
  badgeLabel: "Checkout seguro",
  subtotalLabel: "Gs. 145.000",
  shippingLabel: "A coordinar",
  totalLabel: "Gs. 145.000",
  rows: [
    {
      label: "Protección Cerramos",
      value: "Incluida",
    },
  ],
  helperText:
    "El estado del pago y la confirmación comercial del pedido siguen siendo procesos separados.",
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

function ProgressiveCheckoutStory({
  defaultValues = defaultDeliveryValues,
  merchant = merchantVerified,
  paymentRequired = true,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
  merchant?: CheckoutMerchantSummary;
  paymentRequired?: boolean;
}) {
  const [paymentStage, setPaymentStage] =
    useState<CheckoutPaymentStage>("idle");
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  useEffect(() => {
    if (paymentStage !== "initializing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPaymentStage("ready");
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [paymentStage]);

  const handleReset = () => {
    setPaymentStage("idle");
    setOrderReference(null);
    setIsOrderConfirmed(false);
  };

  return (
    <CheckoutProgressiveFlow
      confirmationMessage="Registramos el pedido, simulamos el cobro exitoso y el comercio seguirá la confirmación operativa por separado."
      defaultValues={defaultValues}
      isOrderConfirmed={isOrderConfirmed}
      merchant={merchant}
      onPaymentConfirm={async () => {
        await wait(1000);
        setIsOrderConfirmed(true);
        return null;
      }}
      onReset={handleReset}
      onSubmit={async () => {
        await wait(900);

        if (!paymentRequired) {
          setOrderReference("ord_storybook_checkout");
          setIsOrderConfirmed(true);
          return null;
        }

        setOrderReference("ord_storybook_checkout");
        setPaymentStage("initializing");
        return null;
      }}
      orderReference={orderReference}
      orderSummary={orderSummary}
      paymentActionLabel="Simular pago aprobado"
      paymentRequired={paymentRequired}
      paymentStage={paymentStage}
      processorSlot={
        paymentRequired ? (
          <CheckoutUpayCardLoader
            formId={paymentStage === "ready" ? "storybook-upay-form-id" : null}
          />
        ) : undefined
      }
      product={product}
      submitLabel={paymentRequired ? "Crear pedido" : "Confirmar pedido"}
    />
  );
}

const meta = {
  title: "checkout/Progressive Checkout",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CheckoutProgressiveFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InteractiveFlow: Story = {
  render: () => <ProgressiveCheckoutStory />,
};

export const MobileInteractiveFlow: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => <ProgressiveCheckoutStory />,
};

export const PaymentUnavailable: Story = {
  render: () => (
    <ProgressiveCheckoutStory merchant={merchantPending} paymentRequired />
  ),
};
