import type { CheckoutPaymentStage } from "@repo/design-system/components/checkout/checkout-payment-section";
import { CheckoutProgressiveFlow } from "@repo/design-system/components/checkout/checkout-progressive-flow";
import { CheckoutUpayCardLoader } from "@repo/design-system/components/checkout/checkout-upay-card-loader";
import { CheckoutUserIdentity } from "@repo/design-system/components/checkout/checkout-user-identity";
import type {
  CheckoutDeliveryValues,
  CheckoutMerchantSummary,
  CheckoutOrderSummary,
  CheckoutProductSummary,
} from "@repo/design-system/components/checkout/types";
import { NonDistractingFooter } from "@repo/design-system/components/layout/non-distracting-footer";
import { NonDistractingHeader } from "@repo/design-system/components/layout/non-distracting-header";
import {
  AuthModal,
  type AuthModalType,
} from "@repo/design-system/components/registration/auth-modal";
import { Button } from "@repo/design-system/components/ui/button";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

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
    "El pago queda dentro de Cerramos y la coordinación comercial sigue su propio estado operativo.",
};

const signedInUser = {
  name: "Camila Ferreira",
  avatarUrl: "https://github.com/shadcn.png",
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

function CheckoutPageStory({
  defaultValues = defaultDeliveryValues,
  paymentRequired = true,
  user = null,
}: {
  defaultValues?: Partial<CheckoutDeliveryValues>;
  paymentRequired?: boolean;
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
    <div className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_34%,var(--color-background)_66%)_0%,var(--color-background)_18rem)] text-foreground">
      <NonDistractingHeader
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
      />
      <main className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <CheckoutProgressiveFlow
          className="min-h-0 bg-transparent px-0 py-0 sm:px-0 sm:py-0 lg:px-0 lg:py-0"
          confirmationMessage="Registramos tu pedido y el pago se completa dentro de Cerramos. La confirmación comercial sigue por separado."
          defaultValues={defaultValues}
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
          orderSummary={orderSummary}
          paymentActionLabel="Simular pago aprobado"
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
          product={product}
          showHeader={false}
          submitLabel={paymentRequired ? "Crear pedido" : "Confirmar pedido"}
        />
      </main>
      <NonDistractingFooter>
        <div className="max-w-md text-center text-muted-foreground text-sm">
          Powered by Cheki
        </div>
      </NonDistractingFooter>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
      />
    </div>
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
  render: () => <CheckoutPageStory user={signedInUser} />,
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
