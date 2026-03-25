"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import {
  AlertCircleIcon,
  BadgeDollarSignIcon,
  BoxesIcon,
  Clock3Icon,
  Grid2x2Icon,
  ImagePlusIcon,
  LayoutListIcon,
  PackagePlusIcon,
  PackageSearchIcon,
  SearchIcon,
  ShoppingBasketIcon,
} from "lucide-react";
import {
  useActionState,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { Header } from "./header";
import {
  type CatalogMetric,
  type CreateProductLinkActionState,
  type FulfillmentFilter,
  initialCreateProductLinkActionState,
  type PaymentFilter,
  type ProductCatalogItem,
  type ViewMode,
} from "./products-catalog.types";

interface ProductsCatalogProperties {
  readonly createProductLinkAction: (
    state: CreateProductLinkActionState,
    payload: FormData
  ) => Promise<CreateProductLinkActionState>;
  readonly metrics: CatalogMetric[];
  readonly products: ProductCatalogItem[];
}

const metricIcons = {
  active: ShoppingBasketIcon,
  attention: Clock3Icon,
  payment: BadgeDollarSignIcon,
  total: BoxesIcon,
} as const;

const metricAccentClasses: Record<CatalogMetric["id"], string> = {
  active: "bg-chart-2/14 text-chart-2 dark:bg-chart-2/20",
  attention: "bg-chart-5/14 text-chart-5 dark:bg-chart-5/20",
  payment: "bg-chart-3 text-foreground dark:bg-chart-3/30",
  total: "bg-primary/12 text-primary dark:bg-primary/18",
};

const statusBadgeClasses: Record<ProductCatalogItem["status"], string> = {
  active:
    "border-primary/25 bg-primary/12 text-primary dark:border-primary/20 dark:bg-primary/16",
  draft:
    "border-border bg-accent text-accent-foreground dark:bg-accent/80 dark:text-accent-foreground",
  expired:
    "border-destructive/25 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15",
  inactive:
    "border-border bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground",
};

const paymentBadgeClass =
  "border-primary/20 bg-background/88 text-foreground/90 backdrop-blur supports-[backdrop-filter]:bg-background/72";

const fieldClassName =
  "h-11 rounded-xl border-border/70 bg-background/70 shadow-none transition-colors focus-visible:border-primary focus-visible:ring-primary/20";

const panelClassName =
  "rounded-[1.5rem] border border-border/70 bg-card shadow-sm";

const imageClassName =
  "h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]";

const renderProductArtwork = (product: ProductCatalogItem) => {
  if (product.imageUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: Product artwork comes from merchant-provided URLs outside the app's fixed image domain allowlist.
      <img
        alt={product.title}
        className={imageClassName}
        height={720}
        loading="lazy"
        src={product.imageUrl}
        width={960}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br from-primary/16 via-accent to-muted p-5">
      <div className="absolute inset-x-[-10%] top-[-25%] h-28 rounded-full bg-primary/14 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-24 w-24 rounded-full bg-chart-2/18 blur-2xl" />
      <div className="relative max-w-[14rem] space-y-2">
        <p className="font-semibold text-[0.65rem] text-primary/80 uppercase tracking-[0.18em]">
          Cerramos
        </p>
        <p className="text-balance font-semibold text-foreground text-lg tracking-tight">
          {product.title}
        </p>
      </div>
    </div>
  );
};

const FilterChip = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <Badge
    className={cn(
      "rounded-full border-border/70 bg-muted/70 px-2.5 py-1 font-medium text-[0.7rem] text-muted-foreground shadow-none",
      className
    )}
    variant="outline"
  >
    {children}
  </Badge>
);

const ProductCard = ({ product }: { product: ProductCatalogItem }) => (
  <article
    className={cn(
      panelClassName,
      "group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
    )}
  >
    <div className="relative aspect-[4/3] overflow-hidden border-border/60 border-b bg-muted">
      {renderProductArtwork(product)}
      <div className="absolute inset-0 bg-gradient-to-t from-background/78 via-background/10 to-transparent" />
      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        {product.paymentRequired ? (
          <Badge className={paymentBadgeClass} variant="outline">
            Cobro previo
          </Badge>
        ) : (
          <span />
        )}
        <Badge
          className={cn(
            "rounded-full px-2.5 py-1 font-semibold text-[0.7rem] shadow-none",
            statusBadgeClasses[product.status]
          )}
          variant="outline"
        >
          {product.statusLabel}
        </Badge>
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="space-y-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground tracking-tight">
            {product.title}
          </h3>
          <p className="line-clamp-2 text-muted-foreground text-sm leading-6">
            {product.description}
          </p>
        </div>
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.16em]">
          /{product.slug}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip>{product.variantSummary}</FilterChip>
        <FilterChip>{product.fulfillmentLabel}</FilterChip>
        <FilterChip>{product.paymentLabel}</FilterChip>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 border-border/60 border-t pt-4">
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-xl tracking-tight">
            {product.formattedPrice}
          </p>
          <p className="text-muted-foreground text-xs">
            {product.updatedLabel}
          </p>
        </div>
        <div className="space-y-1 text-right text-muted-foreground text-sm">
          <p>{product.inventoryLabel}</p>
          <p>{product.expiresLabel}</p>
        </div>
      </div>
    </div>
  </article>
);

const ProductRow = ({ product }: { product: ProductCatalogItem }) => (
  <article
    className={cn(
      panelClassName,
      "group grid gap-4 overflow-hidden p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md md:grid-cols-[13rem_minmax(0,1fr)_auto] md:items-center"
    )}
  >
    <div className="relative aspect-[16/11] overflow-hidden rounded-[1rem] border border-border/60 bg-muted">
      {renderProductArtwork(product)}
      <div className="absolute inset-0 bg-gradient-to-t from-background/68 via-background/5 to-transparent" />
    </div>

    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            "rounded-full px-2.5 py-1 font-semibold text-[0.7rem] shadow-none",
            statusBadgeClasses[product.status]
          )}
          variant="outline"
        >
          {product.statusLabel}
        </Badge>
        <FilterChip>{product.paymentLabel}</FilterChip>
        <FilterChip>{product.fulfillmentLabel}</FilterChip>
      </div>

      <div className="space-y-1">
        <h3 className="truncate font-semibold text-foreground text-lg tracking-tight">
          {product.title}
        </h3>
        <p className="line-clamp-2 text-muted-foreground text-sm leading-6">
          {product.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {product.variantValues.length > 0 ? (
          product.variantValues
            .slice(0, 4)
            .map((variant) => <FilterChip key={variant}>{variant}</FilterChip>)
        ) : (
          <FilterChip>Sin variantes configuradas</FilterChip>
        )}
      </div>
    </div>

    <div className="space-y-3 border-border/60 border-t pt-4 text-sm md:border-t-0 md:border-l md:pt-0 md:pl-6 md:text-right">
      <div className="space-y-1">
        <p className="font-semibold text-foreground text-xl tracking-tight">
          {product.formattedPrice}
        </p>
        <p className="text-muted-foreground">{product.variantSummary}</p>
      </div>
      <div className="space-y-1 text-muted-foreground">
        <p>{product.inventoryLabel}</p>
        <p>{product.expiresLabel}</p>
        <p>{product.updatedLabel}</p>
      </div>
    </div>
  </article>
);

const FilterToolbar = ({
  filteredProductsCount,
  fulfillmentFilter,
  paymentFilter,
  searchValue,
  setFulfillmentFilter,
  setPaymentFilter,
  setSearchValue,
  setStatusFilter,
  setViewMode,
  statusFilter,
  totalProductsCount,
  viewMode,
}: {
  filteredProductsCount: number;
  fulfillmentFilter: FulfillmentFilter;
  paymentFilter: PaymentFilter;
  searchValue: string;
  setFulfillmentFilter: (value: FulfillmentFilter) => void;
  setPaymentFilter: (value: PaymentFilter) => void;
  setSearchValue: (value: string) => void;
  setStatusFilter: (value: "all" | ProductCatalogItem["status"]) => void;
  setViewMode: (value: ViewMode) => void;
  statusFilter: "all" | ProductCatalogItem["status"];
  totalProductsCount: number;
  viewMode: ViewMode;
}) => {
  const summary =
    filteredProductsCount === totalProductsCount
      ? `${totalProductsCount} productos`
      : `${filteredProductsCount} de ${totalProductsCount} productos`;

  return (
    <section className={cn(panelClassName, "p-4")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-base text-foreground tracking-tight">
              Explora y filtra tu catálogo
            </p>
            <p className="text-muted-foreground text-sm leading-6">
              Encuentra rápido qué compartir, qué requiere cobro previo y qué
              necesita atención.
            </p>
          </div>

          <div className="inline-flex items-center rounded-xl border border-border/70 bg-muted/60 p-1">
            <Button
              aria-label="Vista de cuadrícula"
              className={cn(
                "h-9 w-9 rounded-lg border-0 shadow-none",
                viewMode === "grid"
                  ? "bg-background text-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-background/60"
              )}
              onClick={() => setViewMode("grid")}
              size="icon"
              type="button"
              variant="outline"
            >
              <Grid2x2Icon className="size-4" />
            </Button>
            <Button
              aria-label="Vista de lista"
              className={cn(
                "h-9 w-9 rounded-lg border-0 shadow-none",
                viewMode === "list"
                  ? "bg-background text-foreground"
                  : "bg-transparent text-muted-foreground hover:bg-background/60"
              )}
              onClick={() => setViewMode("list")}
              size="icon"
              type="button"
              variant="outline"
            >
              <LayoutListIcon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:items-start">
          <div className="relative min-w-0">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Buscar productos"
              className={cn(fieldClassName, "pl-11")}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar productos, links o variantes"
              value={searchValue}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Select
              onValueChange={(value) =>
                setStatusFilter(value as "all" | ProductCatalogItem["status"])
              }
              value={statusFilter}
            >
              <SelectTrigger className={cn(fieldClassName, "w-full")}>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="expired">Vencido</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => setPaymentFilter(value as PaymentFilter)}
              value={paymentFilter}
            >
              <SelectTrigger className={cn(fieldClassName, "w-full")}>
                <SelectValue placeholder="Cobro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el cobro</SelectItem>
                <SelectItem value="required">Cobro requerido</SelectItem>
                <SelectItem value="optional">Cobro al confirmar</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) =>
                setFulfillmentFilter(value as FulfillmentFilter)
              }
              value={fulfillmentFilter}
            >
              <SelectTrigger className={cn(fieldClassName, "w-full")}>
                <SelectValue placeholder="Entrega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda la entrega</SelectItem>
                <SelectItem value="both">Retiro y entrega</SelectItem>
                <SelectItem value="delivery">Solo entrega</SelectItem>
                <SelectItem value="pickup">Solo retiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-border/60 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">{summary}</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip className="bg-primary/10 text-primary">
              {statusFilter === "all" ? "Todos los estados" : "Estado filtrado"}
            </FilterChip>
            <FilterChip>
              {paymentFilter === "all" ? "Cobro mixto" : "Cobro segmentado"}
            </FilterChip>
            <FilterChip>
              {fulfillmentFilter === "all"
                ? "Entrega flexible"
                : "Entrega filtrada"}
            </FilterChip>
          </div>
        </div>
      </div>
    </section>
  );
};

const AddProductSheet = ({
  createProductLinkAction,
  open,
  onOpenChange,
}: {
  createProductLinkAction: ProductsCatalogProperties["createProductLinkAction"];
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) => {
  const formReference = useRef<HTMLFormElement>(null);
  const [formState, formAction, isPending] = useActionState(
    createProductLinkAction,
    initialCreateProductLinkActionState
  );
  const [status, setStatus] = useState<ProductCatalogItem["status"]>("active");
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);

  useEffect(() => {
    if (formState.status !== "success") {
      return;
    }

    onOpenChange(false);
    formReference.current?.reset();
    setStatus("active");
    setPaymentRequired(false);
    setPickupEnabled(true);
    setDeliveryEnabled(true);
  }, [formState.status, onOpenChange]);

  const fulfillmentError =
    formState.fieldErrors?.pickupEnabled?.[0] ||
    formState.fieldErrors?.deliveryEnabled?.[0];

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full overflow-hidden border-border/70 border-l bg-background p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="gap-4 border-border/70 border-b px-6 py-6 text-left">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <PackagePlusIcon className="size-5" />
            </div>
            <div className="space-y-2">
              <SheetTitle className="font-semibold text-2xl text-foreground tracking-tight">
                Nuevo producto
              </SheetTitle>
              <SheetDescription className="max-w-md text-muted-foreground text-sm leading-6">
                Crea un link vendible para compartir en WhatsApp o Instagram con
                el mismo flujo operativo del catálogo.
              </SheetDescription>
            </div>
          </SheetHeader>

          <form
            action={formAction}
            className="flex min-h-0 flex-1 flex-col"
            ref={formReference}
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <input name="status" type="hidden" value={status} />
              <input
                name="paymentRequired"
                type="hidden"
                value={String(paymentRequired)}
              />
              <input
                name="pickupEnabled"
                type="hidden"
                value={String(pickupEnabled)}
              />
              <input
                name="deliveryEnabled"
                type="hidden"
                value={String(deliveryEnabled)}
              />

              <div className="rounded-[1.25rem] border border-border/70 bg-card p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <ImagePlusIcon className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground text-sm">
                      Información base
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Lo mínimo necesario para publicar y compartir el producto.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nombre del producto</Label>
                    <Input
                      className={fieldClassName}
                      id="title"
                      name="title"
                      placeholder="e.g., Remera premium de algodón"
                    />
                    {formState.fieldErrors?.title?.[0] ? (
                      <p className="text-destructive text-sm">
                        {formState.fieldErrors.title[0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Precio</Label>
                      <Input
                        className={fieldClassName}
                        id="unitPrice"
                        min={0}
                        name="unitPrice"
                        placeholder="129000"
                        step={1}
                        type="number"
                      />
                      {formState.fieldErrors?.unitPrice?.[0] ? (
                        <p className="text-destructive text-sm">
                          {formState.fieldErrors.unitPrice[0]}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        onValueChange={(value) =>
                          setStatus(value as ProductCatalogItem["status"])
                        }
                        value={status}
                      >
                        <SelectTrigger className={fieldClassName}>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="expired">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Imagen principal</Label>
                    <Input
                      className={fieldClassName}
                      id="imageUrl"
                      name="imageUrl"
                      placeholder="https://..."
                    />
                    {formState.fieldErrors?.imageUrl?.[0] ? (
                      <p className="text-destructive text-sm">
                        {formState.fieldErrors.imageUrl[0]}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      className="min-h-28 rounded-xl border-border/70 bg-background/70 shadow-none transition-colors focus-visible:border-primary focus-visible:ring-primary/20"
                      id="description"
                      name="description"
                      placeholder="Explica qué hace que este producto cierre mejor."
                      rows={5}
                    />
                    {formState.fieldErrors?.description?.[0] ? (
                      <p className="text-destructive text-sm">
                        {formState.fieldErrors.description[0]}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-border/70 bg-card p-4">
                <div className="mb-4 space-y-1">
                  <p className="font-semibold text-foreground text-sm">
                    Configuración operativa
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Define cómo se cobra y cómo se entrega este producto.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4 rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3">
                    <div className="space-y-1">
                      <Label className="font-medium text-sm">
                        Cobro previo
                      </Label>
                      <p className="text-muted-foreground text-sm leading-6">
                        Exige pago antes de confirmar el pedido.
                      </p>
                    </div>
                    <Switch
                      checked={paymentRequired}
                      onCheckedChange={setPaymentRequired}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3">
                    <div className="space-y-1">
                      <Label className="font-medium text-sm">
                        Retiro en tienda
                      </Label>
                      <p className="text-muted-foreground text-sm leading-6">
                        Permite cerrar el pedido con retiro presencial.
                      </p>
                    </div>
                    <Switch
                      checked={pickupEnabled}
                      onCheckedChange={setPickupEnabled}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-[1rem] border border-border/70 bg-background/75 px-4 py-3">
                    <div className="space-y-1">
                      <Label className="font-medium text-sm">Entrega</Label>
                      <p className="text-muted-foreground text-sm leading-6">
                        Permite completar dirección y despacho.
                      </p>
                    </div>
                    <Switch
                      checked={deliveryEnabled}
                      onCheckedChange={setDeliveryEnabled}
                    />
                  </div>

                  {fulfillmentError ? (
                    <p className="text-destructive text-sm">
                      {fulfillmentError}
                    </p>
                  ) : null}
                </div>
              </div>

              {formState.message ? (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-[1rem] border px-4 py-3 text-sm",
                    formState.status === "error"
                      ? "border-destructive/30 bg-destructive/10 text-destructive"
                      : "border-primary/25 bg-primary/10 text-primary"
                  )}
                >
                  <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                  <span>{formState.message}</span>
                </div>
              ) : null}
            </div>

            <SheetFooter className="border-border/70 border-t px-6 py-4">
              <Button
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Guardando..." : "Crear producto"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const ProductsCatalog = ({
  createProductLinkAction,
  metrics,
  products,
}: ProductsCatalogProperties) => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ProductCatalogItem["status"]
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [fulfillmentFilter, setFulfillmentFilter] =
    useState<FulfillmentFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddProductSheetOpen, setIsAddProductSheetOpen] = useState(false);

  const deferredSearch = useDeferredValue(searchValue);
  const normalizedQuery = deferredSearch.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      [
        product.description,
        product.slug,
        product.statusLabel,
        product.title,
        ...product.variantValues,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" ||
      (paymentFilter === "required" && product.paymentRequired) ||
      (paymentFilter === "optional" && !product.paymentRequired);
    const matchesFulfillment =
      fulfillmentFilter === "all" ||
      product.fulfillmentMode === fulfillmentFilter;

    return (
      matchesSearch && matchesStatus && matchesPayment && matchesFulfillment
    );
  });

  let catalogContent = (
    <Empty className="rounded-[1.75rem] border border-border/70 border-dashed bg-card px-6 py-16 shadow-sm">
      <EmptyHeader>
        <EmptyMedia
          className="rounded-[1.25rem] bg-primary/12 text-primary"
          variant="icon"
        >
          <PackageSearchIcon />
        </EmptyMedia>
        <EmptyTitle>No hay productos para este filtro</EmptyTitle>
        <EmptyDescription className="max-w-lg text-muted-foreground text-sm leading-6">
          {products.length === 0
            ? "Crea tu primer link vendible para empezar a cerrar pedidos desde redes."
            : "Ajusta búsqueda, estado o cobro para volver a ver tu catálogo."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  if (filteredProducts.length > 0) {
    catalogContent =
      viewMode === "grid" ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="space-y-4">
          {filteredProducts.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </section>
      );
  }

  return (
    <>
      <Header page="Catálogo" pages={["Comercio"]}>
        <Button
          className="mr-4 hidden h-11 rounded-xl bg-primary px-4 text-primary-foreground shadow-none hover:bg-primary/90 md:inline-flex"
          onClick={() => setIsAddProductSheetOpen(true)}
          type="button"
        >
          <PackagePlusIcon className="size-4" />
          Crear producto
        </Button>
      </Header>

      <div className="min-w-0 flex flex-1 flex-col gap-6 p-4 pt-0">
        <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm">
          <div className="border-border/60 border-b px-6 py-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Badge
                  className="rounded-full bg-primary/12 px-3 py-1 font-semibold text-[0.7rem] text-primary uppercase tracking-[0.18em] shadow-none"
                  variant="secondary"
                >
                  Catálogo comercial
                </Badge>
                <div className="space-y-3">
                  <h1 className="font-semibold text-3xl text-foreground tracking-tight md:text-4xl">
                    Productos listos para compartir
                  </h1>
                  <p className="max-w-2xl text-muted-foreground text-sm leading-7 md:text-base">
                    Organiza tus links vendibles en una sola vista, detecta qué
                    requiere atención y comparte más rápido desde WhatsApp o
                    Instagram.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-3">
                  <p className="font-medium text-foreground text-sm">
                    Operación clara
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm leading-6">
                    Filtra por estado, cobro y entrega sin salir del catálogo.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-primary/8 px-4 py-3">
                  <p className="font-medium text-foreground text-sm">
                    Venta más rápida
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm leading-6">
                    Crea un nuevo producto y compártelo con un flujo listo para
                    cerrar pedidos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 md:hidden">
            <Button
              className="h-11 flex-1 rounded-xl bg-primary text-primary-foreground shadow-none hover:bg-primary/90"
              onClick={() => setIsAddProductSheetOpen(true)}
              type="button"
            >
              <PackagePlusIcon className="size-4" />
              Crear producto
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const MetricIcon = metricIcons[metric.id];

            return (
              <article
                className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm"
                key={metric.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-medium text-muted-foreground text-sm">
                      {metric.label}
                    </p>
                    <p className="font-semibold text-3xl text-foreground tracking-tight">
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-2xl",
                      metricAccentClasses[metric.id]
                    )}
                  >
                    <MetricIcon className="size-5" />
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground text-sm leading-6">
                  {metric.note}
                </p>
              </article>
            );
          })}
        </section>

        <FilterToolbar
          filteredProductsCount={filteredProducts.length}
          fulfillmentFilter={fulfillmentFilter}
          paymentFilter={paymentFilter}
          searchValue={searchValue}
          setFulfillmentFilter={setFulfillmentFilter}
          setPaymentFilter={setPaymentFilter}
          setSearchValue={setSearchValue}
          setStatusFilter={setStatusFilter}
          setViewMode={setViewMode}
          statusFilter={statusFilter}
          totalProductsCount={products.length}
          viewMode={viewMode}
        />

        {catalogContent}
      </div>

      <AddProductSheet
        createProductLinkAction={createProductLinkAction}
        onOpenChange={setIsAddProductSheetOpen}
        open={isAddProductSheetOpen}
      />
    </>
  );
};
