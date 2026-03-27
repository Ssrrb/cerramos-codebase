import { CheckoutProgressiveFlow } from "@repo/design-system/components/checkout/checkout-progressive-flow";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "@repo/design-system/components/checkout/types";
import type { Meta, StoryObj } from "@storybook/react";

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
  name: "Set matero de acero con bombilla y funda térmica",
  description:
    "Incluye termo de 1 litro, mate forrado y funda liviana para acompañarte todos los días sin sumar pasos innecesarios al checkout.",
  imageUrl:
    "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80",
  priceLabel: "Gs. 145.000",
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

const completedDetailsValues: CheckoutDeliveryValues = {
  ...defaultDeliveryValues,
  recipientName: "Camila Ferreira",
  email: "camila@cerramos.com",
  phone: "0981 123 456",
};

const pickupValues: CheckoutDeliveryValues = {
  ...completedDetailsValues,
  mode: "pickup",
};

const paymentReadyValues: CheckoutDeliveryValues = {
  ...completedDetailsValues,
  mode: "delivery",
  city: "Asunción",
  addressLine1: "Av. España 742 casi Perú",
  reference: "Portón negro frente a la farmacia",
};

const MockPaymentProcessor = () => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-3 py-2">
      <span className="font-medium text-foreground text-sm">Pagopar uPay</span>
      <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
        Demo
      </span>
    </div>
    <div className="rounded-2xl border border-border/70 border-dashed bg-background/75 px-4 py-5">
      <p className="font-medium text-foreground text-sm">
        Componente embebido del procesador
      </p>
      <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
        Acá vive el iframe o widget certificado para capturar el pago sin salir
        de Cerramos.
      </p>
    </div>
  </div>
);

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

const CheckoutStory = ({
  defaultValues,
  merchant,
  paymentRequired,
  processorReady,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
  merchant: CheckoutMerchantSummary;
  paymentRequired: boolean;
  processorReady?: boolean;
}) => {
  return (
    <CheckoutProgressiveFlow
      defaultValues={defaultValues}
      merchant={merchant}
      orderSummary={orderSummary}
      paymentRequired={paymentRequired}
      processorSlot={processorReady ? <MockPaymentProcessor /> : undefined}
      product={product}
    />
  );
};

const meta = {
  title: "checkout/Progressive Checkout",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CheckoutProgressiveFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultFirstStep: Story = {
  render: () => (
    <CheckoutStory
      defaultValues={defaultDeliveryValues}
      merchant={merchantVerified}
      paymentRequired
    />
  ),
};

export const DetailsCompletedDeliveryActive: Story = {
  render: () => (
    <CheckoutStory
      defaultValues={completedDetailsValues}
      merchant={merchantVerified}
      paymentRequired
    />
  ),
};

export const PickupMode: Story = {
  render: () => (
    <CheckoutStory
      defaultValues={pickupValues}
      merchant={merchantVerified}
      paymentRequired
    />
  ),
};

export const PaymentUnavailable: Story = {
  render: () => (
    <CheckoutStory
      defaultValues={paymentReadyValues}
      merchant={merchantPending}
      paymentRequired
    />
  ),
};

export const PaymentProcessorReady: Story = {
  render: () => (
    <CheckoutStory
      defaultValues={paymentReadyValues}
      merchant={merchantVerified}
      paymentRequired
      processorReady
    />
  ),
};

export const MobileSummaryDrawer: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => (
    <CheckoutStory
      defaultValues={completedDetailsValues}
      merchant={merchantVerified}
      paymentRequired
    />
  ),
};
