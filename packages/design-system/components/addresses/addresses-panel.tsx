"use client";

import { cn } from "@repo/design-system/lib/utils";
import { AddressAddTile } from "./address-add-tile";
import { AddressCard } from "./address-card";
import type { AddressesPanelProps } from "./types";

export function AddressesPanel({
  addTileDescription,
  addTileTitle,
  addresses,
  className,
  emptyDescription = "Guardá tus puntos de entrega frecuentes para confirmar pedidos con menos pasos.",
  footer,
  onAddAddress,
  onEditAddress,
  onRemoveAddress,
  onSetDefaultAddress,
  pendingAddressIds = [],
  title = "Direcciones",
}: AddressesPanelProps) {
  const isEmpty = addresses.length === 0;

  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.18em]">
          Tu cuenta
        </p>
        <div className="space-y-1">
          <h2 className="font-semibold text-3xl tracking-tight">{title}</h2>
          <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
            {isEmpty
              ? emptyDescription
              : "Elegí cuál querés usar por defecto y mantené actualizados los datos de entrega."}
          </p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AddressAddTile
          description={addTileDescription}
          onAdd={onAddAddress}
          title={addTileTitle}
        />
        {addresses.map((address) => (
          <AddressCard
            address={address}
            isPending={pendingAddressIds.includes(address.id)}
            key={address.id}
            onEdit={onEditAddress}
            onRemove={onRemoveAddress}
            onSetDefault={onSetDefaultAddress}
          />
        ))}
      </div>
      {footer ? footer : null}
    </section>
  );
}
