export type ProductLinkStatus = "draft" | "active" | "inactive" | "expired";
export type FulfillmentMode = "both" | "delivery" | "pickup";
export type FilterValue = "all";
export type PaymentFilter = FilterValue | "required" | "optional";
export type FulfillmentFilter = FilterValue | FulfillmentMode;
export type ViewMode = "grid" | "list";

export interface CatalogMetric {
  id: "total" | "active" | "payment" | "attention";
  label: string;
  note: string;
  value: string;
}

export interface ProductCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  currency: string;
  priceValue: number;
  formattedPrice: string;
  status: ProductLinkStatus;
  statusLabel: string;
  paymentRequired: boolean;
  paymentLabel: string;
  fulfillmentLabel: string;
  fulfillmentMode: FulfillmentMode;
  inventoryLabel: string;
  variantSummary: string;
  variantValues: string[];
  expiresAt: string | null;
  expiresLabel: string;
  updatedLabel: string;
}

export interface ProductLinkRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  currency: string;
  unitPrice: number;
  status: ProductLinkStatus;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  expiresAt: Date | null;
  updatedAt: Date;
}

export interface ProductVariantRow {
  additionalPrice: number;
  isDefault: boolean;
  name: string;
  productLinkId: string;
  value: string;
}

export type CreateProductLinkField =
  | "deliveryEnabled"
  | "description"
  | "imageUrl"
  | "paymentRequired"
  | "pickupEnabled"
  | "status"
  | "title"
  | "unitPrice";

export type CreateProductLinkFieldErrors = Partial<
  Record<CreateProductLinkField, string[]>
>;

export interface CreateProductLinkActionState {
  fieldErrors?: CreateProductLinkFieldErrors;
  message?: string;
  status: "idle" | "success" | "error";
}

export const initialCreateProductLinkActionState: CreateProductLinkActionState =
  {
    status: "idle",
  };
