import { database, eq, schema } from "@repo/database";
import { asc } from "drizzle-orm";
import type { CheckoutSavedAddress } from "@repo/design-system/components/checkout/types";

const compact = (value: string | null | undefined) => value?.trim() ?? "";

export const listCheckoutSavedAddresses = async (
  customerId: string
): Promise<CheckoutSavedAddress[]> =>
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
      streetLine1: schema.customerAddress.streetLine1,
      streetLine2: schema.customerAddress.streetLine2,
    })
    .from(schema.customerAddress)
    .innerJoin(
      schema.city,
      eq(schema.customerAddress.cityId, schema.city.id)
    )
    .where(eq(schema.customerAddress.customerId, customerId))
    .orderBy(
      asc(schema.customerAddress.isDefault),
      asc(schema.customerAddress.createdAt)
    )
    .then((rows) =>
      rows
        .map((row) => ({
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
          summary: [compact(row.streetLine1), compact(row.cityName)]
            .filter(Boolean)
            .join(", "),
        }))
        .sort((left, right) =>
          Number(right.isDefault) - Number(left.isDefault)
        )
    );
