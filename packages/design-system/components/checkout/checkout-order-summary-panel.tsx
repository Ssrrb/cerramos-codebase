import { MinusIcon, PlusIcon, ReceiptTextIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Separator } from "../ui/separator";
import { CheckoutProductMedia } from "./checkout-product-media";
import type { CheckoutOrderSummary, CheckoutProductSummary } from "./types";

const formatPriceLabel = (value: number) =>
  `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`;

interface CheckoutSummaryContentProps {
  onQuantityChange?: (quantity: number) => void;
  orderSummary: CheckoutOrderSummary;
  product: CheckoutProductSummary;
}

function CheckoutSummaryContent({
  onQuantityChange,
  orderSummary,
  product,
}: CheckoutSummaryContentProps) {
  const subtotalValue = product.unitPrice * product.quantity;
  const totalLabel = formatPriceLabel(subtotalValue);
  const stockStatusLabel =
    product.availableStock <= 0
      ? "Sin stock disponible"
      : product.availableStock === 1
        ? "Queda 1 unidad disponible"
        : `Hasta ${product.availableStock} unidades disponibles`;

  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-background p-4 shadow-xs sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
            Resumen
          </p>
          <h2 className="mt-2 font-semibold text-foreground text-xl tracking-[-0.02em]">
            {orderSummary.title ?? "Tu pedido"}
          </h2>
        </div>
        <div className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-muted-foreground text-xs">
          {orderSummary.badgeLabel ?? "Compra protegida"}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <CheckoutProductMedia
          className="max-w-full"
          imageUrl={product.imageUrl}
          name={product.name}
          ratio={4 / 3}
        />
        <div className="min-w-0 space-y-1">
          <p className="line-clamp-2 font-medium text-foreground text-sm">
            {product.name}
          </p>
          <p className="line-clamp-4 text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
          <p className="font-medium text-foreground text-sm">
            {product.priceLabel}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-muted/15 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground text-sm">Cantidad</p>
            <p className="mt-1 text-muted-foreground text-sm">
              {stockStatusLabel}
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-border/70 bg-background p-1">
            <button
              aria-label="Reducir cantidad"
              className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled={product.quantity <= 1 || product.availableStock <= 0}
              onClick={() => onQuantityChange?.(product.quantity - 1)}
              type="button"
            >
              <MinusIcon className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center font-semibold text-foreground text-sm"
            >
              {product.quantity}
            </span>
            <button
              aria-label="Aumentar cantidad"
              className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                product.availableStock <= 0 ||
                product.quantity >= product.availableStock
              }
              onClick={() => onQuantityChange?.(product.quantity + 1)}
              type="button"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {formatPriceLabel(subtotalValue)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium text-foreground">
            {orderSummary.shippingLabel}
          </span>
        </div>
        {orderSummary.rows?.map((row) => (
          <div
            className="flex items-center justify-between gap-3 text-sm"
            key={row.label}
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={cn(
                "font-medium text-foreground",
                row.emphasis ? "text-base" : null
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-foreground">Total</span>
        <span className="font-semibold text-foreground text-xl tracking-[-0.02em]">
          {totalLabel}
        </span>
      </div>

      {orderSummary.helperText ? (
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          {orderSummary.helperText}
        </p>
      ) : null}
    </div>
  );
}

interface CheckoutOrderSummaryPanelProps {
  className?: string;
  onQuantityChange?: (quantity: number) => void;
  orderSummary: CheckoutOrderSummary;
  product: CheckoutProductSummary;
}

function CheckoutOrderSummaryPanel({
  className,
  onQuantityChange,
  orderSummary,
  product,
}: CheckoutOrderSummaryPanelProps) {
  return (
    <aside className={cn("hidden lg:block", className)}>
      <div className="sticky top-8">
        <CheckoutSummaryContent
          onQuantityChange={onQuantityChange}
          orderSummary={orderSummary}
          product={product}
        />
      </div>
    </aside>
  );
}

interface CheckoutMobileSummaryBarProps {
  className?: string;
  onQuantityChange?: (quantity: number) => void;
  orderSummary: CheckoutOrderSummary;
  product: CheckoutProductSummary;
}

function CheckoutMobileSummaryBar({
  className,
  onQuantityChange,
  orderSummary,
  product,
}: CheckoutMobileSummaryBarProps) {
  const totalLabel = formatPriceLabel(product.unitPrice * product.quantity);

  return (
    <Drawer>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-border/80 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Total
            </p>
            <p className="truncate font-semibold text-foreground text-lg tracking-[-0.02em]">
              {totalLabel}
            </p>
          </div>
          <DrawerTrigger asChild>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/70 bg-foreground px-4 font-medium text-background text-sm shadow-sm transition-colors hover:bg-foreground/90"
              type="button"
            >
              <ReceiptTextIcon className="size-4" />
              Ver resumen
            </button>
          </DrawerTrigger>
        </div>
      </div>
      <DrawerContent className="max-h-[85vh] rounded-t-[1.75rem]">
        <DrawerHeader className="px-4 pt-4 text-left sm:px-5">
          <DrawerTitle>Resumen del pedido</DrawerTitle>
          <DrawerDescription>
            Revisá el producto y el total sin salir del checkout.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6 sm:px-5">
          <CheckoutSummaryContent
            onQuantityChange={onQuantityChange}
            orderSummary={orderSummary}
            product={product}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { CheckoutMobileSummaryBar, CheckoutOrderSummaryPanel };
