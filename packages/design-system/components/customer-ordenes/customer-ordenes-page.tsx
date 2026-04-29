"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { cn } from "@repo/design-system/lib/utils";
import { Inbox, SearchX, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerAccountHeader } from "./customer-account-header";
import { CustomerTrackingCard } from "./customer-tracking-card";
import { CustomerTrackingFilters } from "./customer-tracking-filters";
import { CustomerTrackingRecommendations } from "./customer-tracking-recommendations";
import type {
  CustomerTrackingAction,
  CustomerTrackingFilter,
  CustomerTrackingItemViewModel,
  CustomerTrackingPageProps,
  CustomerTrackingRefinement,
  CustomerTrackingSummaryItem,
} from "./types";

const defaultFilterOptions = [
  { label: "Todo", value: "all" },
  { label: "Órdenes", value: "orders" },
  { label: "Suscripciones", value: "subscriptions" },
  { label: "Activas", value: "active" },
  { label: "Pasadas", value: "past" },
  { label: "Atención", value: "action-needed" },
] as const;

const defaultRefinements = [
  { label: "Todo el tiempo", value: "all-time" },
  { label: "Últimos 30 días", value: "last-30-days" },
  { label: "Últimos 6 meses", value: "last-6-months" },
  { label: "Últimos 12 meses", value: "last-12-months" },
] as const;

const msPerDay = 1000 * 60 * 60 * 24;
const pastStatusPattern = /(cancelad|venci|archivad|finalizad)/i;

const isActionNeeded = (item: CustomerTrackingItemViewModel) =>
  item.status.tone === "warning" || item.status.tone === "danger";

const isPast = (item: CustomerTrackingItemViewModel) =>
  item.status.tone === "neutral" && pastStatusPattern.test(item.status.label);

const isActive = (item: CustomerTrackingItemViewModel) =>
  !(isPast(item) || isActionNeeded(item));

const matchesFilter = (
  item: CustomerTrackingItemViewModel,
  filter: CustomerTrackingFilter
) => {
  switch (filter) {
    case "orders":
      return item.kind === "order";
    case "subscriptions":
      return item.kind === "subscription";
    case "active":
      return isActive(item);
    case "past":
      return isPast(item);
    case "action-needed":
      return isActionNeeded(item);
    default:
      return true;
  }
};

const matchesRefinement = (
  item: CustomerTrackingItemViewModel,
  refinement: CustomerTrackingRefinement
) => {
  if (refinement === "all-time") {
    return true;
  }

  const occurredAt = new Date(item.occurredAt);

  if (Number.isNaN(occurredAt.getTime())) {
    return true;
  }

  const now = Date.now();
  const ageInDays = (now - occurredAt.getTime()) / msPerDay;

  switch (refinement) {
    case "last-30-days":
      return ageInDays <= 30;
    case "last-6-months":
      return ageInDays <= 183;
    case "last-12-months":
      return ageInDays <= 366;
    default:
      return true;
  }
};

const matchesSearch = (
  item: CustomerTrackingItemViewModel,
  searchTerm: string
) => {
  if (!searchTerm.trim()) {
    return true;
  }

  const query = searchTerm.toLocaleLowerCase();
  const searchSpace = [
    item.amountLabel,
    item.merchantLabel,
    item.reference,
    item.status.detail,
    item.status.label,
    item.subtitle,
    item.title,
    item.orderDetails?.deliveryNote,
    item.orderDetails?.trackingMilestone,
    item.subscriptionDetails?.renewalStatus,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return searchSpace.includes(query);
};

const buildSummary = (items: CustomerTrackingItemViewModel[]) => {
  const summary: CustomerTrackingSummaryItem[] = [
    {
      description: "órdenes y suscripciones visibles",
      label: "Total",
      value: String(items.length),
    },
    {
      description: "todavía en seguimiento",
      label: "Activas",
      value: String(items.filter(isActive).length),
    },
    {
      description: "podrían requerir una revisión tuya",
      label: "Atención",
      value: String(items.filter(isActionNeeded).length),
    },
  ];

  return summary;
};

function EmptyState({
  action,
  description,
  icon,
  title,
}: {
  action?: CustomerTrackingAction;
  description: string;
  icon: "empty" | "error" | "search";
  title: string;
}) {
  let Icon = Inbox;

  if (icon === "error") {
    Icon = TriangleAlert;
  } else if (icon === "search") {
    Icon = SearchX;
  }

  return (
    <Empty className="rounded-[1.5rem] border border-border border-dashed bg-background/80 py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? (
        <Button asChild>
          <a href={action.href}>{action.label}</a>
        </Button>
      ) : null}
    </Empty>
  );
}

export function CustomerOrdenesPage({
  breadcrumbItems,
  className,
  description,
  emptyState = {
    action: {
      href: "/",
      label: "Explorar productos",
    },
    description:
      "Cuando hagas tu primera compra o actives una suscripción, este espacio te va a enseñar el estado y el próximo paso.",
    title: "Todavía no tenés actividad en tu cuenta",
  },
  errorState = {
    action: {
      href: ".",
      label: "Volver a intentar",
    },
    description:
      "No pudimos cargar tu historial ahora mismo. Probá de nuevo en unos minutos.",
    title: "Hubo un problema al recuperar tus órdenes",
  },
  filters,
  footerContent,
  initialActiveFilter = "all",
  initialRefinement = "all-time",
  initialSearchTerm = "",
  items,
  listTitle = "Seguimiento reciente",
  recommendations = [],
  recommendationsDescription,
  recommendationsTitle,
  refinements,
  searchPlaceholder,
  showErrorState = false,
  summary,
  title,
}: CustomerTrackingPageProps) {
  const [activeFilter, setActiveFilter] =
    useState<CustomerTrackingFilter>(initialActiveFilter);
  const [refinement, setRefinement] =
    useState<CustomerTrackingRefinement>(initialRefinement);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesFilter(item, activeFilter) &&
          matchesRefinement(item, refinement) &&
          matchesSearch(item, searchTerm)
      ),
    [activeFilter, items, refinement, searchTerm]
  );

  const summaryItems = summary ?? buildSummary(items);
  const filterOptions =
    filters ??
    defaultFilterOptions.map((option) => ({
      ...option,
      count: items.filter((item) => matchesFilter(item, option.value)).length,
    }));
  const listContent = (() => {
    if (filteredItems.length) {
      return filteredItems.map((item) => (
        <CustomerTrackingCard item={item} key={item.id} />
      ));
    }

    if (items.length) {
      return (
        <EmptyState
          description="Probá con otro período, cambiá de pestaña o buscá por el nombre del comercio."
          icon="search"
          title="No hay coincidencias con tu búsqueda"
        />
      );
    }

    return (
      <EmptyState
        action={emptyState.action}
        description={emptyState.description}
        icon="empty"
        title={emptyState.title}
      />
    );
  })();

  if (showErrorState) {
    return (
      <section
        className={cn(
          "min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_28%,var(--color-background)_72%)_0%,var(--color-background)_26rem)] px-4 py-6 sm:px-6 lg:px-8",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <CustomerAccountHeader
            breadcrumbItems={breadcrumbItems}
            description={description}
            summary={summaryItems}
            title={title}
          />
          <EmptyState
            action={errorState.action}
            description={errorState.description}
            icon="error"
            title={errorState.title}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_28%,var(--color-background)_72%)_0%,var(--color-background)_26rem)] px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <CustomerAccountHeader
          breadcrumbItems={breadcrumbItems}
          description={description}
          summary={summaryItems}
          title={title}
        />

        <CustomerTrackingFilters
          activeFilter={activeFilter}
          filters={filterOptions}
          onFilterChange={setActiveFilter}
          onRefinementChange={setRefinement}
          onSearchTermChange={setSearchTerm}
          refinement={refinement}
          refinements={refinements ?? [...defaultRefinements]}
          searchPlaceholder={searchPlaceholder}
          searchTerm={searchTerm}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-xl tracking-tight">
                  {listTitle}
                </h2>
                <p className="text-muted-foreground text-sm leading-6">
                  {filteredItems.length
                    ? `${filteredItems.length} resultado${filteredItems.length === 1 ? "" : "s"} en tu historial`
                    : "No encontramos resultados con esos filtros"}
                </p>
              </div>
            </div>

            {listContent}

            {footerContent ? (
              <div className="text-muted-foreground text-sm leading-6">
                {footerContent}
              </div>
            ) : null}
          </div>

          <CustomerTrackingRecommendations
            description={recommendationsDescription}
            items={recommendations}
            title={recommendationsTitle}
          />
        </div>
      </div>
    </section>
  );
}
