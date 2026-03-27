import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { CheckCircle2Icon, ShieldAlertIcon } from "lucide-react";
import type { CheckoutMerchantSummary } from "./types";

interface CheckoutMerchantCardProps {
  className?: string;
  merchant: CheckoutMerchantSummary;
}

const merchantNameSeparator = /\s+/;

const getMerchantInitials = (name: string) =>
  name
    .trim()
    .split(merchantNameSeparator)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("") || "CE";

const getMerchantTrustMeta = (
  trustState: CheckoutMerchantSummary["trustState"]
) => {
  if (trustState === "verified") {
    return {
      icon: CheckCircle2Icon,
      label: "Comercio verificado por Cerramos",
      title: "Verificado",
      description:
        "Cerramos confirmó la identidad operativa básica de este comercio.",
      badgeClassName:
        "bg-emerald-500 text-white shadow-[0_6px_18px_-10px_color-mix(in_oklab,var(--color-emerald-500)_70%,transparent)]",
    };
  }

  let label = "Comercio no verificado";
  let title = "Sin verificar";
  let description =
    "Cerramos todavía no confirmó la identidad operativa de este comercio.";

  if (trustState === "pending_review") {
    label = "Verificación pendiente";
    title = "Verificación pendiente";
    description =
      "Cerramos recibió la información del comercio y sigue revisándola.";
  } else if (trustState === "limited") {
    label = "Verificación limitada";
    title = "Verificación limitada";
    description =
      "Este comercio tiene acceso limitado mientras Cerramos valida más información.";
  } else if (trustState === "suspended") {
    label = "Comercio suspendido";
    title = "Comercio suspendido";
    description =
      "Cerramos suspendió temporalmente este comercio hasta completar una nueva revisión.";
  }

  return {
    icon: ShieldAlertIcon,
    label,
    title,
    description,
    badgeClassName:
      "bg-[color-mix(in_oklab,var(--color-background)_84%,var(--color-amber-500)_16%)] text-[color-mix(in_oklab,var(--color-foreground)_74%,var(--color-amber-700)_26%)] shadow-sm",
  };
};

function CheckoutMerchantCard({
  className,
  merchant,
}: CheckoutMerchantCardProps) {
  const trustMeta = getMerchantTrustMeta(merchant.trustState);
  const TrustIcon = trustMeta.icon;

  return (
    <div className={cn("flex items-center gap-3 px-1 py-0.5", className)}>
      <div className="relative shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <button
              aria-label={`${trustMeta.label}. Abrir detalles de confianza.`}
              className="group relative block rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              type="button"
            >
              <Avatar className="size-12 border border-border/65 bg-muted/35 shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.02] group-active:scale-[0.98] motion-reduce:transition-none">
                <AvatarImage
                  alt={merchant.name}
                  src={merchant.avatarUrl ?? undefined}
                />
                <AvatarFallback className="font-medium text-sm">
                  {getMerchantInitials(merchant.name)}
                </AvatarFallback>
              </Avatar>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background transition-transform duration-200 ease-out motion-reduce:transition-none",
                  trustMeta.badgeClassName
                )}
              >
                <TrustIcon className="size-3.5" />
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border-border/70 bg-popover/98 p-3.5 shadow-lg"
            side="bottom"
            sideOffset={10}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  trustMeta.badgeClassName
                )}
              >
                <TrustIcon className="size-3.5" />
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm tracking-[-0.01em]">
                  {trustMeta.title}
                </p>
                <p className="text-muted-foreground text-sm leading-5">
                  {trustMeta.description}
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-foreground text-sm tracking-[-0.01em] sm:text-[0.95rem]">
          {merchant.name}
        </p>
        <span className="sr-only">{trustMeta.label}</span>
      </div>
    </div>
  );
}

export { CheckoutMerchantCard };
