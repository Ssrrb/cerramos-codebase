import { CheckoutPage } from "@repo/design-system/components/checkout/checkout-page";
import {
  checkoutParaguayCountryOption,
  checkoutParaguayStateOptions,
  getCheckoutParaguayCityOptions,
} from "@repo/design-system/components/checkout/checkout-paraguay-locations";
import type { CheckoutPaymentStage } from "@repo/design-system/components/checkout/checkout-payment-section";
import { CheckoutUpayCardLoader } from "@repo/design-system/components/checkout/checkout-upay-card-loader";
import { CheckoutUserIdentity } from "@repo/design-system/components/checkout/checkout-user-identity";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
  CheckoutSavedAddress,
} from "@repo/design-system/components/checkout/types";
import {
  AuthModal,
  type AuthModalType,
} from "@repo/design-system/components/registration/auth-modal";
import { Button } from "@repo/design-system/components/ui/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

const centralStateOption = checkoutParaguayStateOptions.find(
  (option) => option.label === "Central"
);
const sanLorenzoCityOption = getCheckoutParaguayCityOptions(
  centralStateOption?.value
).find((option) => option.label === "San Lorenzo");

const merchantVerified: CheckoutMerchantSummary = {
  name: "Casa Nube",
  avatarUrl:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80",
  trustState: "verified",
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

const subscriptionProduct: CheckoutProductSummary = {
  availableStock: 999,
  name: "Plan Growth mensual",
  description:
    "Suscripción mensual con soporte prioritario, panel operativo y recordatorios automáticos para cerrar ventas sin seguimiento manual.",
  imageUrl:
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80",
  priceLabel: "Gs. 89.000 / mes",
  quantity: 1,
  unitPrice: 89_000,
};

const serviceProduct: CheckoutProductSummary = {
  availableStock: 999,
  name: "Asesoría express de catálogo",
  description:
    "Sesión remota de 45 minutos para ordenar catálogo, precios y link de cobro sin coordinar entrega física.",
  imageUrl:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
  priceLabel: "Gs. 220.000",
  quantity: 1,
  unitPrice: 220_000,
};

const defaultDeliveryValues: CheckoutDeliveryValues = {
  recipientName: "Camila Ferreira",
  email: "camila@cerramos.com",
  phone: "0981 123 456",
  mode: "delivery",
  countryId: checkoutParaguayCountryOption.value,
  stateId: centralStateOption?.value ?? "",
  cityId: sanLorenzoCityOption?.value ?? "",
  streetLine1: "Av. España 742 casi Perú",
  streetLine2: "Depto 204, Torre 2",
  referenceNote: "Portón negro frente a la farmacia",
  postalCode: "",
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
    "El pago queda dentro de Cerramos y la coordinación comercial sigue su propio estado operativo.",
};

const subscriptionOrderSummary: CheckoutOrderSummary = {
  title: "Tu suscripción",
  badgeLabel: "Cobro recurrente",
  subtotalLabel: "Gs. 89.000 / mes",
  shippingLabel: "Sin entrega",
  totalLabel: "Gs. 89.000 / mes",
  rows: [
    {
      label: "Periodicidad",
      value: "Mensual",
    },
    {
      label: "Cancelación",
      value: "Cuando quieras",
    },
  ],
  helperText:
    "El primer cobro se confirma en este checkout y las renovaciones siguen el ciclo de la suscripción.",
};

const serviceOrderSummary: CheckoutOrderSummary = {
  title: "Tu reserva",
  badgeLabel: "Coordinación directa",
  subtotalLabel: "Gs. 220.000",
  shippingLabel: "No aplica",
  totalLabel: "Gs. 220.000",
  rows: [
    {
      label: "Modalidad",
      value: "Videollamada",
    },
    {
      label: "Duración",
      value: "45 min",
    },
  ],
  helperText:
    "Usaremos tus datos para coordinar horario y acceso a la sesión, sin pedir datos de entrega.",
};

const signedInUser = {
  name: "Camila Ferreira",
  avatarUrl: "https://github.com/shadcn.png",
};

const signedInSavedAddresses: CheckoutSavedAddress[] = [
  {
    cityId: sanLorenzoCityOption?.value ?? "city_py_san_lorenzo",
    countryId: checkoutParaguayCountryOption.value,
    id: "address_storybook_home",
    isDefault: true,
    label: "Casa",
    postalCode: "1000",
    recipientName: "Camila Ferreira",
    referenceNote: "Portón negro frente a la farmacia",
    stateId: centralStateOption?.value ?? "state_py_central",
    streetLine1: "Av. España 742 casi Perú",
    streetLine2: "Depto 204, Torre 2",
    summary: "Av. España 742 casi Perú, San Lorenzo",
  },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

function CheckoutPageStory({
  defaultValues = defaultDeliveryValues,
  copyVariant = "order",
  confirmationMessage = "Registramos tu pedido y el pago se completa dentro de Cerramos. La confirmación comercial sigue por separado.",
  orderSummary: storyOrderSummary = orderSummary,
  paymentRequired = true,
  paymentActionLabel = "Simular pago aprobado",
  product: storyProduct = product,
  savedAddresses = [],
  skipFulfillmentStep = false,
  submitLabel,
  user = null,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
  copyVariant?: "order" | "subscription";
  confirmationMessage?: string;
  orderSummary?: CheckoutOrderSummary;
  paymentRequired?: boolean;
  paymentActionLabel?: string;
  product?: CheckoutProductSummary;
  savedAddresses?: CheckoutSavedAddress[];
  skipFulfillmentStep?: boolean;
  submitLabel?: string;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
}) {
  const [paymentStage, setPaymentStage] =
    useState<CheckoutPaymentStage>("idle");
  const [orderReference, setOrderReference] = useState<string | null>(null);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [authModalType, setAuthModalType] = useState<AuthModalType>("sign-in");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const reset = () => {
    setPaymentStage("idle");
    setOrderReference(null);
    setIsOrderConfirmed(false);
  };

  const openAuthModal = (type: AuthModalType) => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <CheckoutPage
        accountAction={
          user ? (
            <CheckoutUserIdentity user={user} />
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                className="h-auto px-0 font-semibold text-inherit text-xs"
                onClick={() => openAuthModal("sign-in")}
                type="button"
                variant="link"
              >
                Ingresar
              </Button>
            </div>
          )
        }
        allowSavedAddresses={Boolean(user)}
        confirmationMessage={confirmationMessage}
        copyVariant={copyVariant}
        defaultValues={defaultValues}
        footerContent="Powered by Cheki"
        isOrderConfirmed={isOrderConfirmed}
        merchant={merchantVerified}
        onPaymentConfirm={async () => {
          await wait(1000);
          setIsOrderConfirmed(true);
          return null;
        }}
        onReset={reset}
        onSubmit={async () => {
          await wait(900);

          if (!paymentRequired) {
            setOrderReference("ord_storybook_checkout_page");
            setIsOrderConfirmed(true);
            return null;
          }

          setOrderReference("ord_storybook_checkout_page");
          setPaymentStage("initializing");
          return null;
        }}
        orderReference={orderReference}
        orderSummary={storyOrderSummary}
        paymentActionLabel={paymentActionLabel}
        paymentRequired={paymentRequired}
        paymentStage={paymentStage}
        processorSlot={
          paymentRequired ? (
            <CheckoutUpayCardLoader
              formId={
                paymentStage === "ready" ? "storybook-upay-form-id" : null
              }
            />
          ) : undefined
        }
        product={storyProduct}
        savedAddresses={savedAddresses}
        skipFulfillmentStep={skipFulfillmentStep}
        submitLabel={
          submitLabel ?? (paymentRequired ? "Crear pedido" : "Confirmar pedido")
        }
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
      />
    </>
  );
}

const meta = {
  title: "checkout/Checkout Page",
  component: CheckoutPageStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CheckoutPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GuestConversion: Story = {
  args: {},
  render: () => <CheckoutPageStory />,
};

export const SignedInConversion: Story = {
  args: {},
  render: () => (
    <CheckoutPageStory
      savedAddresses={signedInSavedAddresses}
      user={signedInUser}
    />
  ),
};

export const MobileGuestConversion: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  render: () => <CheckoutPageStory />,
};

export const SubscriptionPaymentCheckout: Story = {
  args: {},
  render: () => (
    <CheckoutPageStory
      confirmationMessage="Registramos tu suscripción y el pago inicial se completa dentro de Cerramos. Las renovaciones seguirán el ciclo configurado."
      copyVariant="subscription"
      defaultValues={{
        ...defaultDeliveryValues,
        mode: "pickup",
      }}
      orderSummary={subscriptionOrderSummary}
      paymentActionLabel="Simular activación"
      paymentRequired
      product={subscriptionProduct}
      submitLabel="Crear suscripción"
    />
  ),
};

export const ServiceCheckoutNoDelivery: Story = {
  args: {},
  render: () => (
    <CheckoutPageStory
      confirmationMessage="Registramos tu reserva y el pago queda confirmado dentro de Cerramos. El comercio coordinará la sesión por separado."
      defaultValues={{
        ...defaultDeliveryValues,
        mode: "pickup",
      }}
      orderSummary={serviceOrderSummary}
      paymentActionLabel="Simular pago confirmado"
      paymentRequired
      product={serviceProduct}
      skipFulfillmentStep
      submitLabel="Reservar servicio"
    />
  ),
};
