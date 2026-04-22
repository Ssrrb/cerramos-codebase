export interface OrderEmailKeyValue {
  emphasis?: boolean;
  label: string;
  value: string;
}

export interface OrderEmailParty {
  avatarUrl?: string | null;
  email?: string | null;
  name: string;
  phone?: string | null;
  roleLabel?: string | null;
}

export interface OrderEmailAddress {
  lines: string[];
  referenceNote?: string | null;
}

export interface OrderEmailLineItem {
  id: string;
  imageUrl?: string | null;
  name: string;
  quantity: number;
  sku?: string | null;
  totalLabel: string;
  unitLabel: string;
  variantLabel?: string | null;
}

export interface OrderEmailContent {
  body?: string[];
  eyebrow?: string | null;
  headline: string;
  intro?: string | null;
  outro?: string | null;
  preheader?: string | null;
  subject: string;
}

export interface OrderEmailSharedData {
  commerce: {
    legalName?: string | null;
    logoUrl?: string | null;
    name: string;
    sender?: OrderEmailParty | null;
    supportEmail?: string | null;
    supportPhone?: string | null;
  };
  customer: OrderEmailParty;
  delivery?: {
    address?: OrderEmailAddress | null;
    etaLabel?: string | null;
    instructions?: string | null;
    methodLabel: string;
    pickupLocationLabel?: string | null;
    trackingLabel?: string | null;
  } | null;
  items: OrderEmailLineItem[];
  order: {
    placedAtLabel?: string | null;
    processedAtLabel?: string | null;
    reference: string;
    sourceLabel?: string | null;
    statusLabel: string;
  };
  payment?: {
    amountLabel?: string | null;
    methodLabel?: string | null;
    reference?: string | null;
    statusLabel: string;
  } | null;
  summary: {
    rows: OrderEmailKeyValue[];
    totalLabel: string;
  };
}

export interface CommerceOrderEmailData extends OrderEmailSharedData {
  commerceEmail: {
    actionItems?: string[];
    content: OrderEmailContent;
    recipients?: string[];
  };
}

export interface ClientOrderEmailData extends OrderEmailSharedData {
  clientEmail: {
    content: OrderEmailContent;
    supportNotice?: string | null;
  };
}

export interface OrderEmailPreviewBaseProps<TData> {
  className?: string;
  data?: TData | null;
  emptyStateDescription?: string;
  emptyStateTitle?: string;
  isLoading?: boolean;
}

export interface CommerceOrderEmailPreviewProps
  extends OrderEmailPreviewBaseProps<CommerceOrderEmailData> {}

export interface ClientOrderEmailPreviewProps
  extends OrderEmailPreviewBaseProps<ClientOrderEmailData> {}

export interface OrderEmailReviewDeckProps {
  className?: string;
  clientData?: ClientOrderEmailData | null;
  commerceData?: CommerceOrderEmailData | null;
  defaultTab?: "client" | "commerce";
  isLoading?: boolean;
}
