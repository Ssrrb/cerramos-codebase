import type { CheckoutLocationData } from "@repo/design-system/components/checkout/types";
import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

export interface CustomerAddressSummary {
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

export interface AddressFormValues {
  cityId: string;
  countryId: string;
  isDefault: boolean;
  label: string;
  phone: string;
  postalCode: string;
  recipientName: string;
  referenceNote: string;
  stateId: string;
  streetLine1: string;
  streetLine2: string;
}

export interface AddressFormFieldNames<TFieldValues extends FieldValues> {
  cityId: FieldPath<TFieldValues>;
  countryId: FieldPath<TFieldValues>;
  isDefault: FieldPath<TFieldValues>;
  label: FieldPath<TFieldValues>;
  phone: FieldPath<TFieldValues>;
  postalCode: FieldPath<TFieldValues>;
  recipientName: FieldPath<TFieldValues>;
  referenceNote: FieldPath<TFieldValues>;
  stateId: FieldPath<TFieldValues>;
  streetLine1: FieldPath<TFieldValues>;
  streetLine2: FieldPath<TFieldValues>;
}

export interface AddressAddTileProps {
  className?: string;
  ctaLabel?: string;
  description?: string;
  disabled?: boolean;
  onAdd?: () => void;
  title?: string;
}

export interface AddressCardProps {
  address: CustomerAddressSummary;
  className?: string;
  isPending?: boolean;
  onEdit?: (addressId: string) => void;
  onRemove?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export interface AddressesPanelProps {
  addTileDescription?: string;
  addTileTitle?: string;
  addresses: CustomerAddressSummary[];
  className?: string;
  emptyDescription?: string;
  footer?: ReactNode;
  onAddAddress?: () => void;
  onEditAddress?: (addressId: string) => void;
  onRemoveAddress?: (addressId: string) => void;
  onSetDefaultAddress?: (addressId: string) => void;
  pendingAddressIds?: string[];
  title?: string;
}

export interface AddressFormSectionProps<TFieldValues extends FieldValues> {
  actions?: ReactNode;
  className?: string;
  control: Control<TFieldValues>;
  description?: string;
  disabled?: boolean;
  footer?: ReactNode;
  locationData?: CheckoutLocationData;
  mode?: "create" | "edit";
  names: AddressFormFieldNames<TFieldValues>;
  title?: string;
}
