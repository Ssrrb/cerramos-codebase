"use client";

import { buttonVariants } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Plus } from "lucide-react";
import type { AddressAddTileProps } from "./types";

export function AddressAddTile({
  className,
  ctaLabel = "Agregar dirección",
  description = "Guardá una dirección para completar pedidos futuros sin volver a cargar todos los datos.",
  disabled,
  onAdd,
  title = "Nueva dirección",
}: AddressAddTileProps) {
  return (
    <button
      className={cn(
        "group flex min-h-[18rem] w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/35 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={disabled}
      onClick={onAdd}
      type="button"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-background text-muted-foreground shadow-xs transition-colors group-hover:text-primary">
        <Plus className="size-8" />
      </span>
      <div className="mt-5 max-w-xs space-y-2">
        <p className="font-semibold text-lg leading-tight">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <span className="mt-6" aria-hidden="true">
        <span className={buttonVariants({ variant: "outline" })}>
          {ctaLabel}
        </span>
      </span>
    </button>
  );
}
