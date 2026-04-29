import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/design-system/components/ui/breadcrumb";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type {
  CustomerTrackingPageProps,
  CustomerTrackingSummaryItem,
} from "./types";

const defaultBreadcrumbItems = [{ label: "Cuenta" }, { label: "Órdenes" }];

const renderBreadcrumbContent = ({
  href,
  isLast,
  label,
}: {
  href?: string;
  isLast: boolean;
  label: string;
}) => {
  if (isLast) {
    return <BreadcrumbPage>{label}</BreadcrumbPage>;
  }

  if (href) {
    return <BreadcrumbLink href={href}>{label}</BreadcrumbLink>;
  }

  return <span className="text-muted-foreground">{label}</span>;
};

function SummaryCard({ item }: { item: CustomerTrackingSummaryItem }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-xs">
      <p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
        {item.label}
      </p>
      <p className="mt-2 font-semibold text-2xl tracking-tight">{item.value}</p>
      {item.description ? (
        <p className="mt-1 text-muted-foreground text-xs leading-5">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

export function CustomerAccountHeader({
  breadcrumbItems = defaultBreadcrumbItems,
  className,
  description = "Seguí tus compras y suscripciones en un mismo lugar, con el contexto justo para entender qué sigue y cuándo volver a comprar.",
  summary = [],
  title = "Tus órdenes",
}: Pick<
  CustomerTrackingPageProps,
  "breadcrumbItems" | "className" | "description" | "summary" | "title"
>) {
  return (
    <header className={cn("space-y-6", className)}>
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <div className="contents" key={item.href ?? item.label}>
                  <BreadcrumbItem>
                    {renderBreadcrumbContent({
                      href: item.href,
                      isLast,
                      label: item.label,
                    })}
                  </BreadcrumbItem>
                  {isLast ? null : (
                    <BreadcrumbSeparator>
                      <ChevronRight className="size-3.5" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/8 px-3 py-1 text-emerald-700 text-xs dark:text-emerald-300">
              <ShieldCheck className="size-3.5" />
              Historial privado de tu cuenta
            </div>
            <div className="space-y-2">
              <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-muted-foreground text-sm leading-6 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {summary.length ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[32rem]">
              {summary.map((item) => (
                <SummaryCard item={item} key={item.label} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
