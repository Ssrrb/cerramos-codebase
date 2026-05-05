import type { ReactNode } from "react";

export type CustomerTrackingKind = "order" | "subscription";

export type CustomerTrackingFilter =
  | "all"
  | "orders"
  | "subscriptions"
  | "active"
  | "past"
  | "action-needed";

export type CustomerTrackingRefinement =
  | "all-time"
  | "last-30-days"
  | "last-6-months"
  | "last-12-months";

export type CustomerTrackingTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface CustomerTrackingAction {
  href: string;
  label: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

export interface CustomerTrackingTimelineEntry {
  label: string;
  tone?: CustomerTrackingTone;
  value: string;
}

export interface CustomerTrackingStatus {
  detail?: string;
  label: string;
  tone: CustomerTrackingTone;
}

export interface CustomerTrackingItemViewModel {
  amountLabel: string;
  id: string;
  kind: CustomerTrackingKind;
  merchantLabel: string;
  occurredAt: string;
  orderDetails?: {
    deliveryNote?: string;
    fulfillmentStatus?: string;
    reorderEligible?: boolean;
    trackingMilestone?: string;
  };
  primaryAction?: CustomerTrackingAction;
  reference: string;
  secondaryActions?: CustomerTrackingAction[];
  status: CustomerTrackingStatus;
  subscriptionDetails?: {
    cadenceLabel?: string;
    managementEligible?: boolean;
    nextChargeLabel?: string;
    renewalStatus?: string;
  };
  subtitle?: string;
  timeline: CustomerTrackingTimelineEntry[];
  title: string;
}

export interface CustomerTrackingFilterOption {
  count?: number;
  label: string;
  value: CustomerTrackingFilter;
}

export interface CustomerTrackingRefinementOption {
  label: string;
  value: CustomerTrackingRefinement;
}

export interface CustomerTrackingSummaryItem {
  description?: string;
  label: string;
  value: string;
}

export interface CustomerTrackingRecommendation {
  action: CustomerTrackingAction;
  badgeLabel?: string;
  description: string;
  id: string;
  priceLabel?: string;
  title: string;
}

export interface CustomerTrackingEmptyState {
  action?: CustomerTrackingAction;
  description: string;
  title: string;
}

export interface CustomerTrackingPageProps {
  breadcrumbItems?: Array<{
    href?: string;
    label: string;
  }>;
  className?: string;
  description?: string;
  emptyState?: CustomerTrackingEmptyState;
  errorState?: CustomerTrackingEmptyState;
  filters?: CustomerTrackingFilterOption[];
  footerContent?: ReactNode;
  initialActiveFilter?: CustomerTrackingFilter;
  initialRefinement?: CustomerTrackingRefinement;
  initialSearchTerm?: string;
  items: CustomerTrackingItemViewModel[];
  listTitle?: string;
  recommendations?: CustomerTrackingRecommendation[];
  recommendationsDescription?: string;
  recommendationsTitle?: string;
  refinements?: CustomerTrackingRefinementOption[];
  searchPlaceholder?: string;
  showErrorState?: boolean;
  summary?: CustomerTrackingSummaryItem[];
  title?: string;
}
