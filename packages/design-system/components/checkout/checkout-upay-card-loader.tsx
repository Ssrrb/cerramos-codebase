import { cn } from "@repo/design-system/lib/utils";
import {
  ExternalLinkIcon,
  LockKeyholeIcon,
  WalletCardsIcon,
} from "lucide-react";

interface CheckoutUpayCardLoaderProps {
  actionLabel?: string;
  className?: string;
  formId?: string | null;
  helperText?: string;
}

function CheckoutUpayCardLoader({
  actionLabel = "Abrir aparte",
  className,
  helperText = "La marca, el número de tarjeta y la autorización del cobro se resuelven dentro del iframe certificado por Pagopar uPay.",
  formId,
}: CheckoutUpayCardLoaderProps) {
  const trimmedFormId = formId?.trim() ?? "";

  if (!trimmedFormId) {
    return (
      <div
        className={cn(
          "rounded-[1.25rem] border border-border/70 border-dashed bg-[color-mix(in_oklab,var(--color-background)_90%,var(--color-muted)_10%)] px-4 py-5",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background text-muted-foreground">
            <WalletCardsIcon className="size-4.5" />
          </div>
          <div className="space-y-2">
            <div className="space-y-1">
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
                Preparando uPay
              </p>
              <p className="font-medium text-foreground text-sm">
                El pedido ya fue creado. Estamos dejando listo el pago seguro.
              </p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              En cuanto Pagopar entregue el formulario, la tarjeta se completará
              dentro de este bloque sin salir de Cerramos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const iframeUrl = `https://www.pagopar.com/upay-iframe/?id-form=${encodeURIComponent(trimmedFormId)}`;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-[1.25rem] border border-border/70 bg-background px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/25 text-foreground">
              <LockKeyholeIcon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm">
                Pagopar uPay
              </p>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                Pago embebido con tarjeta dentro del componente certificado del
                proveedor.
              </p>
            </div>
          </div>
          <a
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground"
            href={iframeUrl}
            rel="noreferrer"
            target="_blank"
          >
            {actionLabel}
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          {helperText}
        </p>
      </div>
      <div className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-background shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_4%,transparent)]">
        <iframe
          className="block min-h-[380px] w-full border-0 bg-background"
          loading="lazy"
          src={iframeUrl}
          title="Pagopar uPay"
        />
      </div>
    </div>
  );
}

export { CheckoutUpayCardLoader };
