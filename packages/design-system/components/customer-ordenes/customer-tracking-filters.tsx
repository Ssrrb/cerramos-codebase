"use client";

import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { cn } from "@repo/design-system/lib/utils";
import { Search } from "lucide-react";
import type {
  CustomerTrackingFilter,
  CustomerTrackingFilterOption,
  CustomerTrackingRefinement,
  CustomerTrackingRefinementOption,
} from "./types";

const defaultFilterOptions: CustomerTrackingFilterOption[] = [
  { label: "Todo", value: "all" },
  { label: "Órdenes", value: "orders" },
  { label: "Suscripciones", value: "subscriptions" },
  { label: "Activas", value: "active" },
  { label: "Pasadas", value: "past" },
  { label: "Atención", value: "action-needed" },
];

const defaultRefinements: CustomerTrackingRefinementOption[] = [
  { label: "Todo el tiempo", value: "all-time" },
  { label: "Últimos 30 días", value: "last-30-days" },
  { label: "Últimos 6 meses", value: "last-6-months" },
  { label: "Últimos 12 meses", value: "last-12-months" },
];

export function CustomerTrackingFilters({
  activeFilter,
  className,
  filters = defaultFilterOptions,
  onFilterChange,
  onRefinementChange,
  onSearchTermChange,
  refinement,
  refinements = defaultRefinements,
  searchPlaceholder = "Buscar por referencia, comercio o producto",
  searchTerm,
}: {
  activeFilter: CustomerTrackingFilter;
  className?: string;
  filters?: CustomerTrackingFilterOption[];
  onFilterChange: (value: CustomerTrackingFilter) => void;
  onRefinementChange: (value: CustomerTrackingRefinement) => void;
  onSearchTermChange: (value: string) => void;
  refinement: CustomerTrackingRefinement;
  refinements?: CustomerTrackingRefinementOption[];
  searchPlaceholder?: string;
  searchTerm: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background/90 p-4 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar en tu historial"
              className="h-11 rounded-xl border-border/70 bg-background pl-9 shadow-none"
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder={searchPlaceholder}
              value={searchTerm}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            aria-label="Filtros de historial"
            className="inline-flex h-auto w-full flex-wrap gap-2 rounded-xl bg-muted/55 p-1 sm:w-auto"
            role="tablist"
          >
            {filters.map((option) => {
              const isActive = option.value === activeFilter;

              return (
                <button
                  aria-selected={isActive}
                  className={cn(
                    "inline-flex h-9 flex-none items-center justify-center gap-1.5 rounded-lg border px-3 font-medium text-sm transition",
                    isActive
                      ? "border-border bg-background text-foreground shadow-xs"
                      : "border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  )}
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  role="tab"
                  type="button"
                >
                  <span>{option.label}</span>
                  {typeof option.count === "number" ? (
                    <span className="rounded-full bg-background/90 px-1.5 py-0.5 text-[11px]">
                      {option.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <Select
            onValueChange={(value) =>
              onRefinementChange(value as CustomerTrackingRefinement)
            }
            value={refinement}
          >
            <SelectTrigger
              aria-label="Refinar por período"
              className="h-11 min-w-48 rounded-xl border-border/70 bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {refinements.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
