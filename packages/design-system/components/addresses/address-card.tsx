"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import type { AddressCardProps } from "./types";

function AddressAction({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      className="h-auto px-0 py-0 font-medium text-sm"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="link"
    >
      {children}
    </Button>
  );
}

export function AddressCard({
  address,
  className,
  isPending = false,
  onEdit,
  onRemove,
  onSetDefault,
}: AddressCardProps) {
  const footerActions = [
    {
      key: "edit",
      label: "Editar",
      onClick: onEdit ? () => onEdit(address.id) : undefined,
    },
    {
      key: "remove",
      label: "Eliminar",
      onClick: onRemove ? () => onRemove(address.id) : undefined,
    },
    !address.isDefault
      ? {
          key: "default",
          label: "Usar como predeterminada",
          onClick: onSetDefault ? () => onSetDefault(address.id) : undefined,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onClick?: () => void;
  }>;

  return (
    <Card
      className={cn(
        "min-h-[18rem] justify-between gap-0 rounded-[1.75rem] border-border/70 py-0 shadow-xs",
        address.isDefault && "border-primary/25 bg-primary/[0.03]",
        className
      )}
    >
      <CardHeader className="gap-3 border-b border-border/70 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {address.isDefault ? (
            <Badge className="rounded-full px-3 py-1" variant="secondary">
              Predeterminada
            </Badge>
          ) : null}
          {address.label?.trim() ? (
            <span className="text-muted-foreground text-sm uppercase tracking-[0.18em]">
              {address.label}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 px-5 py-5 sm:px-6">
        <div className="space-y-1.5">
          <p className="font-semibold text-xl leading-tight">
            {address.recipientName?.trim() || "Sin nombre de contacto"}
          </p>
          <div className="space-y-1 text-sm leading-relaxed sm:text-[15px]">
            <p>{address.streetLine1}</p>
            {address.streetLine2?.trim() ? <p>{address.streetLine2}</p> : null}
            <p>{address.summary}</p>
            {address.postalCode?.trim() ? (
              <p>Código postal: {address.postalCode}</p>
            ) : null}
            {address.phone?.trim() ? <p>Teléfono: {address.phone}</p> : null}
          </div>
        </div>
        {address.referenceNote?.trim() ? (
          <p className="rounded-2xl bg-muted/45 px-4 py-3 text-muted-foreground text-sm leading-relaxed">
            Referencia: {address.referenceNote}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex-wrap gap-2 border-t border-border/70 px-5 py-5 sm:px-6">
        {isPending ? (
          <p className="text-muted-foreground text-sm">
            Actualizando dirección…
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {footerActions.map((action, index) => (
              <div className="flex items-center gap-2" key={action.key}>
                <AddressAction
                  disabled={!action.onClick}
                  onClick={action.onClick}
                >
                  {action.label}
                </AddressAction>
                {index < footerActions.length - 1 ? (
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    |
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
