export type CheckoutTrustState =
  | "pending_review"
  | "verified"
  | "limited"
  | "rejected"
  | "suspended";

export interface CheckoutMerchantSummary {
  avatarUrl?: string | null;
  name: string;
  trustState: CheckoutTrustState;
}

export interface CheckoutProductSummary {
  availableStock: number;
  description: string;
  imageUrl: string;
  name: string;
  priceLabel: string;
  quantity: number;
  unitPrice: number;
}

export type CheckoutStepId = "details" | "delivery" | "payment";

export interface CheckoutCollapsedStepSummary {
  lines: string[];
  stepId: CheckoutStepId;
}

export interface CheckoutOrderSummaryRow {
  emphasis?: boolean;
  label: string;
  value: string;
}

export interface CheckoutOrderSummary {
  badgeLabel?: string;
  helperText?: string;
  rows?: CheckoutOrderSummaryRow[];
  shippingLabel: string;
  subtotalLabel: string;
  title?: string;
  totalLabel: string;
}

export interface CheckoutLocationOption {
  label: string;
  value: string;
}

export interface CheckoutLocationState extends CheckoutLocationOption {
  countryId: string;
}

export interface CheckoutLocationCity extends CheckoutLocationOption {
  stateId: string;
}

export interface CheckoutLocationData {
  cities: CheckoutLocationCity[];
  countries: CheckoutLocationOption[];
  states: CheckoutLocationState[];
}

export type CheckoutDeliveryMode = "delivery" | "pickup";

export interface CheckoutDeliveryModeAvailability {
  delivery: boolean;
  pickup: boolean;
}

export interface CheckoutSavedAddress {
  cityId: string;
  countryId: string;
  id: string;
  isDefault: boolean;
  label?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  recipientName?: string | null;
  referenceNote?: string | null;
  stateId: string;
  streetLine1: string;
  streetLine2?: string | null;
  summary: string;
}

export interface CheckoutDeliveryValues {
  cityId: string;
  countryId: string;
  customerAddressId?: string;
  email: string;
  mode: CheckoutDeliveryMode;
  notes?: string;
  postalCode?: string;
  phone: string;
  referenceNote?: string;
  recipientName: string;
  saveAddress?: boolean;
  saveAsDefault?: boolean;
  stateId: string;
  streetLine1: string;
  streetLine2?: string;
}
