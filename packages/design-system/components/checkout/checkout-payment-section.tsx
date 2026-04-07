import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  paymentRequired: boolean;
  paymentStage?: CheckoutPaymentStage;
  processorSlot?: ReactNode;
  trustState: CheckoutTrustState;
}

function CheckoutPaymentSection({
  actionSlot,
  className,
  paymentRequired,
  paymentStage = "idle",
  processorSlot,
  trustState,
}: CheckoutPaymentSectionProps) {
  const isVerified = trustState === "verified";
  const isProcessorInitializing = paymentStage === "initializing";
  const isProcessorReady = paymentStage === "ready";
  let paymentStateMeta = {
    eyebrow: "Próximo paso",
    title: "Vas a continuar al pago seguro",
    description:
      "Primero creamos el pedido y después cargamos el componente certificado de Pagopar uPay dentro de este checkout.",
    icon: CreditCardIcon,
    panelClassName:
      "border border-dashed border-border/70 bg-muted/20 px-5 py-6",
  };

  if (isProcessorInitializing) {
    paymentStateMeta = {
      eyebrow: "Inicializando pago",
      title: "Pedido creado, preparando el cobro seguro",
      description:
        "Estamos dejando listo el componente certificado de Pagopar uPay para que completes la tarjeta sin salir de Cerramos.",
      icon: LoaderCircleIcon,
      panelClassName:
        "border border-border/70 bg-[color-mix(in_oklab,var(--color-background)_88%,var(--color-muted)_12%)] p-4",
    };
  }

  if (isProcessorReady) {
    paymentStateMeta = {
      eyebrow: "Pago seguro listo",
      title: "Pedido creado, completá el pago",
      description:
        "La tarjeta se ingresa y se procesa únicamente dentro del componente certificado de Pagopar uPay.",
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
            <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
              {paymentStateMeta.eyebrow}
            </p>
            <h3 className="font-medium text-base text-foreground">
              {paymentStateMeta.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {paymentStateMeta.description}
            </p>
          </div>
          {processorSlot ? (
            <div className="pt-1">{processorSlot}</div>
          ) : (
            <div className="rounded-[1rem] border border-border/70 bg-background/80 px-4 py-3">
              <p className="font-medium text-foreground text-sm">
                Pagopar uPay embebido
              </p>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                La marca, el número de tarjeta y la captura del pago se
                resuelven dentro del iframe certificado del proveedor.
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
            Este comercio todavía no habilitó el cobro embebido con Pagopar
            uPay.
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
            Este pedido no requiere pago online
          </EmptyTitle>
          <EmptyDescription className="w-full text-left">
            El comercio va a coordinar el cobro después de confirmar el pedido.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  let footerCopy =
    "Primero se crea el pedido y luego se carga el componente certificado del proveedor para completar el cobro dentro de Cerramos.";

  if (!(paymentRequired && isVerified)) {
    footerCopy =
      "El estado del pago y la confirmación comercial del pedido siguen siendo procesos separados.";
  } else if (isProcessorReady) {
    footerCopy =
      "Completar el pago no reemplaza la confirmación operativa del comercio. Cerramos seguirá mostrando ambos estados por separado.";
  }

  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Pago</CardDescription>
        <CardTitle className="text-base">Finalizá el checkout</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {paymentContent}
        {actionSlot ? (
          <div
            className={cn("mt-4", isProcessorReady ? "opacity-70" : undefined)}
          >
            {actionSlot}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="border-border/70 border-t pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {footerCopy}
        </p>
      </CardFooter>
    </Card>
  );
}

export { CheckoutPaymentSection };
export type { CheckoutPaymentStage };
