import type { CustomerAddressSummary } from "@repo/design-system/components/addresses";
import { database, eq, schema } from "@repo/database";
import { asc } from "drizzle-orm";

const compact = (value: string | null | undefined) => value?.trim() ?? "";

export const toCustomerAddressSummary = (row: {
  cityId: string;
  cityName: string | null;
  countryId: string;
  id: string;
  isDefault: boolean;
  label: string | null;
  phone: string | null;
  postalCode: string | null;
  recipientName: string | null;
  referenceNote: string | null;
  stateId: string;
  stateName: string | null;
  streetLine1: string;
  streetLine2: string | null;
}): CustomerAddressSummary => ({
  cityId: row.cityId,
  countryId: row.countryId,
  id: row.id,
  isDefault: row.isDefault,
  label: row.label,
  phone: row.phone,
  postalCode: row.postalCode,
  recipientName: row.recipientName,
  referenceNote: row.referenceNote,
  stateId: row.stateId,
  streetLine1: row.streetLine1,
  streetLine2: row.streetLine2,
  summary:
    [compact(row.cityName), compact(row.stateName)].filter(Boolean).join(", ") ||
    "Paraguay",
});

export const getCustomerAddressesPageData = async (
  customerId: string
): Promise<CustomerAddressSummary[]> =>
  database
    .select({
      cityId: schema.customerAddress.cityId,
      cityName: schema.city.name,
      countryId: schema.customerAddress.countryId,
      id: schema.customerAddress.id,
      isDefault: schema.customerAddress.isDefault,
      label: schema.customerAddress.label,
      phone: schema.customerAddress.phone,
      postalCode: schema.customerAddress.postalCode,
      recipientName: schema.customerAddress.recipientName,
      referenceNote: schema.customerAddress.referenceNote,
      stateId: schema.customerAddress.stateId,
      stateName: schema.state.name,
      streetLine1: schema.customerAddress.streetLine1,
      streetLine2: schema.customerAddress.streetLine2,
    })
    .from(schema.customerAddress)
    .innerJoin(schema.city, eq(schema.customerAddress.cityId, schema.city.id))
    .innerJoin(
      schema.state,
      eq(schema.customerAddress.stateId, schema.state.id)
    )
    .where(eq(schema.customerAddress.customerId, customerId))
    .orderBy(
      asc(schema.customerAddress.isDefault),
      asc(schema.customerAddress.createdAt)
    )
    .then((rows) =>
      rows
        .map(toCustomerAddressSummary)
        .sort((left, right) => Number(right.isDefault) - Number(left.isDefault))
    );
