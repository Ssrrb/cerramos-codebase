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
  description: string;
  imageUrl: string;
  name: string;
  priceLabel: string;
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

export type CheckoutDeliveryMode = "delivery" | "pickup";

export interface CheckoutDeliveryValues {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  email: string;
  mode: CheckoutDeliveryMode;
  notes?: string;
  phone: string;
  recipientName: string;
  reference?: string;
}
