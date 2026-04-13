import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { cn } from "@repo/design-system/lib/utils";
import {
  CreditCardIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  ShieldAlertIcon,
  WalletMinimalIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { CheckoutTrustState } from "./types";

type CheckoutPaymentStage = "idle" | "initializing" | "ready";

interface CheckoutPaymentSectionProps {
  actionSlot?: ReactNode;
  className?: string;
  orderReference?: string | null;
  paymentRequired: boolean;
  paymentStage?: CheckoutPaymentStage;
  processorSlot?: ReactNode;
  trustState: CheckoutTrustState;
}

function CheckoutPaymentSection({
  actionSlot,
  className,
  orderReference,
  paymentRequired,
  paymentStage = "idle",
  processorSlot,
  trustState,
}: CheckoutPaymentSectionProps) {
  const isVerified = trustState === "verified";
  const isProcessorInitializing = paymentStage === "initializing";
  const isProcessorReady = paymentStage === "ready";
  let paymentStateMeta = {
    title: "Pago seguro",
    description: "Vas a continuar al pago después de crear el pedido.",
    icon: CreditCardIcon,
    panelClassName:
      "border border-dashed border-border/70 bg-muted/20 px-5 py-5",
  };

  if (isProcessorInitializing) {
    paymentStateMeta = {
      title: "Preparando pago",
      description: "Estamos cargando el formulario seguro.",
      icon: LoaderCircleIcon,
      panelClassName:
        "border border-border/70 bg-[color-mix(in_oklab,var(--color-background)_88%,var(--color-muted)_12%)] p-4",
    };
  }

  if (isProcessorReady) {
    paymentStateMeta = {
      title: "Completá el pago",
      description: "Ingresá tu tarjeta en el formulario seguro.",
      icon: LockKeyholeIcon,
      panelClassName:
        "border border-border/70 bg-[color-mix(in_oklab,var(--color-background)_92%,var(--color-muted)_8%)] p-4",
    };
  }

  const PaymentStateIcon = paymentStateMeta.icon;

  let paymentContent = (
    <div className={cn("rounded-[1.25rem]", paymentStateMeta.panelClassName)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background text-muted-foreground">
          <PaymentStateIcon
            className={cn(
              "size-4.5",
              isProcessorInitializing ? "animate-spin" : undefined
            )}
          />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-base text-foreground">
              {paymentStateMeta.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {paymentStateMeta.description}
            </p>
          </div>
          {processorSlot ? (
            <div className="pt-1">{processorSlot}</div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <p className="font-medium text-foreground text-sm">
                Formulario de pago
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                Se carga dentro del checkout cuando el pedido está listo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!isVerified) {
    paymentContent = (
      <Empty className="rounded-[1.25rem] border border-border/70 bg-muted/20 px-5 py-6">
        <EmptyHeader className="max-w-none items-start text-left">
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle className="w-full text-left text-base">
            Pago online no disponible
          </EmptyTitle>
          <EmptyDescription className="w-full text-left">
            Este comercio no tiene pago embebido disponible.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!paymentRequired) {
    paymentContent = (
      <Empty className="rounded-[1.25rem] border-border/70 bg-muted/20 px-5 py-6">
        <EmptyHeader className="max-w-none items-start text-left">
          <EmptyMedia variant="icon">
            <WalletMinimalIcon />
          </EmptyMedia>
          <EmptyTitle className="w-full text-left text-base">
            Sin pago online
          </EmptyTitle>
          <EmptyDescription className="w-full text-left">
            El cobro se coordina con el comercio.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card
      className={cn(
        "gap-0 rounded-[1.75rem] border-border/70 shadow-xs",
        className
      )}
    >
      <CardHeader className="gap-1.5 px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
        <CardTitle className="text-base">Finalizá el checkout</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6">
        {orderReference ? (
          <div className="mb-4 rounded-[1.25rem] border border-border/70 bg-muted/20 px-4 py-3.5">
            <p className="font-medium text-foreground text-sm">Pedido creado</p>
            <p className="mt-1 break-all font-mono text-muted-foreground text-sm">
              {orderReference}
            </p>
          </div>
        ) : null}
        {paymentContent}
        {actionSlot ? (
          <div
            className={cn("mt-4", isProcessorReady ? "opacity-70" : undefined)}
          >
            {actionSlot}
          </div>
        ) : null}
        {paymentRequired && isVerified ? (
          <p className="mt-4 text-muted-foreground text-xs leading-relaxed">
            Tus datos de pago se cargan en un formulario seguro del proveedor.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { CheckoutPaymentSection };
export type { CheckoutPaymentStage };
