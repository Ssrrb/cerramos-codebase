import {
  BadgeCheckIcon,
  CreditCardIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  ShoppingBagIcon,
  StoreIcon,
  UserRoundIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import type {
  OrderEmailContent,
  OrderEmailKeyValue,
  OrderEmailLineItem,
  OrderEmailParty,
  OrderEmailSharedData,
} from "./types";

const whitespacePattern = /\s+/;

const getInitials = (name: string) =>
  name
    .split(whitespacePattern)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

function PreviewEmptyState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card className="rounded-[1.75rem] border-border/70 border-dashed bg-muted/15 shadow-none">
      <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border/70 bg-background">
          <MailIcon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="mt-5 font-semibold text-xl tracking-[-0.02em]">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function PreviewLoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 rounded-[1.75rem]" />
      <Skeleton className="h-72 rounded-[1.5rem]" />
      <Skeleton className="h-64 rounded-[1.5rem]" />
    </div>
  );
}

function EmailCanvas({
  badgeLabel,
  children,
  content,
  commerce,
  recipientLabel,
}: {
  badgeLabel: string;
  children: ReactNode;
  commerce: OrderEmailSharedData["commerce"];
  content: OrderEmailContent;
  recipientLabel: string;
}) {
  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-border/70 bg-background shadow-xs">
      <CardHeader className="gap-5 border-border/70 border-b bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_32%,var(--color-background)_68%)_0%,var(--color-background)_100%)] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="size-12 rounded-2xl border border-border/70">
              <AvatarImage
                alt={commerce.name}
                src={commerce.logoUrl ?? undefined}
              />
              <AvatarFallback className="rounded-2xl bg-muted/50 font-medium">
                {getInitials(commerce.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-base">{commerce.name}</p>
              {commerce.legalName ? (
                <p className="text-muted-foreground text-sm">
                  {commerce.legalName}
                </p>
              ) : null}
              <p className="text-muted-foreground text-sm">{recipientLabel}</p>
            </div>
          </div>

          <Badge
            className="border-border/70 bg-background/90 px-3 py-1 text-foreground"
            variant="outline"
          >
            <BadgeCheckIcon className="size-3.5" />
            {badgeLabel}
          </Badge>
        </div>

        <div className="space-y-2">
          {content.eyebrow ? (
            <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
              {content.eyebrow}
            </p>
          ) : null}
          <h2 className="font-semibold text-xl tracking-[-0.03em] sm:text-2xl">
            {content.subject}
          </h2>
          {content.preheader ? (
            <CardDescription className="max-w-3xl text-sm leading-relaxed sm:text-base">
              {content.preheader}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </CardContent>
    </Card>
  );
}

function MessageBody({ content }: { content: OrderEmailContent }) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-2xl tracking-[-0.03em]">
          {content.headline}
        </h3>
        {content.intro ? (
          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed sm:text-base">
            {content.intro}
          </p>
        ) : null}
      </div>

      {content.body?.length ? (
        <div className="space-y-3 text-sm leading-relaxed sm:text-[0.95rem]">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}

      {content.outro ? (
        <p className="font-medium text-sm leading-relaxed sm:text-[0.95rem]">
          {content.outro}
        </p>
      ) : null}
    </section>
  );
}

function InfoSection({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-muted/10 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background">
          {icon}
        </div>
        <div className="min-w-0 space-y-1">
          <h4 className="font-medium text-sm sm:text-base">{title}</h4>
          {description ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KeyValueList({ items }: { items: OrderEmailKeyValue[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          className="flex items-start justify-between gap-4 text-sm"
          key={`${item.label}-${item.value}`}
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span
            className={cn(
              "max-w-[62%] text-right font-medium text-foreground",
              item.emphasis ? "text-base" : null
            )}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function PartySnapshot({
  party,
  subtitle,
  title,
}: {
  party: OrderEmailParty;
  subtitle?: string;
  title: string;
}) {
  const rows = [
    party.email ? { label: "Email", value: party.email } : null,
    party.phone ? { label: "Teléfono", value: party.phone } : null,
    party.roleLabel ? { label: "Rol", value: party.roleLabel } : null,
  ].filter(Boolean) as OrderEmailKeyValue[];

  return (
    <InfoSection
      description={subtitle}
      icon={<UserRoundIcon className="size-4 text-foreground" />}
      title={title}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-11 rounded-2xl border border-border/70">
          <AvatarImage alt={party.name} src={party.avatarUrl ?? undefined} />
          <AvatarFallback className="rounded-2xl bg-background">
            {getInitials(party.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{party.name}</p>
          {rows.length ? <KeyValueList items={rows} /> : null}
        </div>
      </div>
    </InfoSection>
  );
}

function OrderSnapshot({ data }: { data: OrderEmailSharedData }) {
  const rows = [
    { label: "Referencia", value: data.order.reference },
    { label: "Estado del pedido", value: data.order.statusLabel },
    data.order.placedAtLabel
      ? { label: "Registrado", value: data.order.placedAtLabel }
      : null,
    data.order.processedAtLabel
      ? { label: "Procesado", value: data.order.processedAtLabel }
      : null,
    data.order.sourceLabel
      ? { label: "Origen", value: data.order.sourceLabel }
      : null,
  ].filter(Boolean) as OrderEmailKeyValue[];

  return (
    <InfoSection
      description="Resumen principal del pedido para mantener el estado operativo visible."
      icon={<ShoppingBagIcon className="size-4 text-foreground" />}
      title="Pedido"
    >
      <KeyValueList items={rows} />
    </InfoSection>
  );
}

function FulfillmentSnapshot({
  data,
  description,
}: {
  data: OrderEmailSharedData;
  description: string;
}) {
  return (
    <InfoSection
      description={description}
      icon={<MapPinIcon className="size-4 text-foreground" />}
      title="Entrega"
    >
      <div className="space-y-3 text-sm">
        <div className="space-y-1">
          <p className="font-medium">
            {data.delivery?.methodLabel ?? "Coordinación pendiente"}
          </p>
          {data.delivery?.etaLabel ? (
            <p className="text-muted-foreground">{data.delivery.etaLabel}</p>
          ) : null}
        </div>

        {data.delivery?.pickupLocationLabel ? (
          <p>
            <span className="text-muted-foreground">Punto de retiro:</span>{" "}
            <span className="font-medium">
              {data.delivery.pickupLocationLabel}
            </span>
          </p>
        ) : null}

        {data.delivery?.address?.lines?.length ? (
          <div className="space-y-1 rounded-[1.25rem] border border-border/70 bg-background px-4 py-3">
            {data.delivery.address.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {data.delivery.address.referenceNote ? (
              <p className="text-muted-foreground">
                Referencia: {data.delivery.address.referenceNote}
              </p>
            ) : null}
          </div>
        ) : null}

        {data.delivery?.trackingLabel ? (
          <p>
            <span className="text-muted-foreground">Seguimiento:</span>{" "}
            <span className="font-medium">{data.delivery.trackingLabel}</span>
          </p>
        ) : null}

        {data.delivery?.instructions ? (
          <p className="text-muted-foreground leading-relaxed">
            {data.delivery.instructions}
          </p>
        ) : null}
      </div>
    </InfoSection>
  );
}

function PaymentSnapshot({
  data,
  description,
}: {
  data: OrderEmailSharedData;
  description: string;
}) {
  const rows = [
    {
      label: "Estado del pago",
      value: data.payment?.statusLabel ?? "Sin datos de pago",
    },
    data.payment?.methodLabel
      ? { label: "Método", value: data.payment.methodLabel }
      : null,
    data.payment?.amountLabel
      ? { label: "Importe", value: data.payment.amountLabel }
      : null,
    data.payment?.reference
      ? { label: "Referencia", value: data.payment.reference }
      : null,
  ].filter(Boolean) as OrderEmailKeyValue[];

  return (
    <InfoSection
      description={description}
      icon={<CreditCardIcon className="size-4 text-foreground" />}
      title="Pago"
    >
      <KeyValueList items={rows} />
    </InfoSection>
  );
}

function OrderItems({
  items,
  summary,
  title,
}: {
  items: OrderEmailLineItem[];
  summary: OrderEmailSharedData["summary"];
  title: string;
}) {
  return (
    <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-muted/10 p-4 sm:p-5">
      <div className="space-y-1">
        <h4 className="font-medium text-sm sm:text-base">{title}</h4>
        <p className="text-muted-foreground text-sm">
          Artículos y totales incluidos en el correo.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            className="flex items-start gap-4 rounded-[1.25rem] border border-border/70 bg-background px-4 py-3"
            key={item.id}
          >
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/15">
              {item.imageUrl ? (
                // biome-ignore lint/performance/noImgElement: Storybook-first preview intentionally stays framework-agnostic.
                <img
                  alt={item.name}
                  className="size-full object-cover"
                  height={64}
                  src={item.imageUrl}
                  width={64}
                />
              ) : (
                <PackageIcon className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-sm sm:text-base">{item.name}</p>
              {item.variantLabel ? (
                <p className="text-muted-foreground text-sm">
                  {item.variantLabel}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
                {item.sku ? <span>SKU {item.sku}</span> : null}
                <span>Cantidad {item.quantity}</span>
                <span>{item.unitLabel}</span>
              </div>
            </div>

            <p className="shrink-0 font-medium text-sm sm:text-base">
              {item.totalLabel}
            </p>
          </div>
        ))}
      </div>

      <Separator />

      <KeyValueList
        items={[
          ...summary.rows,
          {
            emphasis: true,
            label: "Total",
            value: summary.totalLabel,
          },
        ]}
      />
    </section>
  );
}

function ContactFooter({
  email,
  note,
  phone,
  senderName,
}: {
  email?: string | null;
  note?: string | null;
  phone?: string | null;
  senderName?: string | null;
}) {
  if (!(email || phone || note || senderName)) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-sm sm:text-base">Contacto</p>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {senderName
              ? `${senderName} queda como contacto del comercio.`
              : "Usá este contacto si necesitás resolver cambios o dudas."}
          </p>
        </div>
        <div className="space-y-2 text-sm">
          {email ? (
            <p className="flex items-center gap-2">
              <MailIcon className="size-4 text-muted-foreground" />
              <span>{email}</span>
            </p>
          ) : null}
          {phone ? (
            <p className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-muted-foreground" />
              <span>{phone}</span>
            </p>
          ) : null}
        </div>
      </div>
      {note ? (
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          {note}
        </p>
      ) : null}
    </section>
  );
}

function ActionItems({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <InfoSection
      description="Acciones operativas destacadas en el correo del comercio."
      icon={<StoreIcon className="size-4 text-foreground" />}
      title="Próximos pasos"
    >
      <div className="space-y-2">
        {items.map((item) => (
          <div
            className="rounded-[1rem] border border-border/70 bg-background px-3 py-3 text-sm"
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    </InfoSection>
  );
}

export {
  ActionItems,
  ContactFooter,
  EmailCanvas,
  FulfillmentSnapshot,
  InfoSection,
  MessageBody,
  OrderItems,
  OrderSnapshot,
  PartySnapshot,
  PaymentSnapshot,
  PreviewEmptyState,
  PreviewLoadingState,
};
