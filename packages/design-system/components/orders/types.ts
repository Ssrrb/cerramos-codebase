import type { ReactNode } from "react";

export type OrderStatus =
  | "new"
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "cancelled"
  | "expired";

export type PaymentStatus =
  | "not_required"
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded";

export type OrdersFilter = "all" | "actionable" | OrderStatus;

export interface MerchantOrder {
  createdAtLabel: string;
  customerContact?: string;
  customerName: string;
  expiresAtLabel?: string;
  fulfillmentLabel: string;
  id: string;
  note?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  productSubtitle?: string;
  productTitle: string;
  reference: string;
  totalLabel: string;
}

export interface OrdersPageSummaryItem {
  description?: string;
  label: string;
  value: string;
}

export interface OrdersPageProps {
  activeFilter?: OrdersFilter;
  className?: string;
  description?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  footerContent?: ReactNode;
  onCancelOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  onFilterChange?: (filter: OrdersFilter) => void;
  orders: MerchantOrder[];
  summary?: OrdersPageSummaryItem[];
  title?: string;
  updatingOrderIds?: string[];
}
