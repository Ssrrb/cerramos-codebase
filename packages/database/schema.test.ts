import { getTableName } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import * as schema from "./schema";

describe("schema profile exports", () => {
  test("keeps customer as a compatibility alias for customerProfile", () => {
    expect(schema.customer).toBe(schema.customerProfile);
    expect(getTableName(schema.customerProfile)).toBe("CustomerProfile");
    expect(getTableName(schema.customer)).toBe("CustomerProfile");
  });

  test("exposes the merchant profile table and its key columns", () => {
    expect(getTableName(schema.merchantProfile)).toBe("MerchantProfile");
    expect(schema.customerProfile.userId.name).toBe("userId");
    expect(schema.customerProfile.image.name).toBe("image");
    expect(schema.merchantProfile.userId.name).toBe("userId");
    expect(schema.merchantProfile.commerceId.name).toBe("commerceId");
    expect(schema.merchantProfile.role.name).toBe("role");
  });

  test("exposes normalized geography and customer address tables", () => {
    expect(getTableName(schema.country)).toBe("Country");
    expect(getTableName(schema.state)).toBe("State");
    expect(getTableName(schema.city)).toBe("City");
    expect(getTableName(schema.customerAddress)).toBe("CustomerAddress");
    expect(schema.deliveryInfo.customerAddressId.name).toBe("customerAddressId");
    expect(schema.deliveryInfo.countryId.name).toBe("countryId");
    expect(schema.deliveryInfo.stateId.name).toBe("stateId");
    expect(schema.deliveryInfo.cityId.name).toBe("cityId");
    expect(schema.deliveryInfo.streetLine1.name).toBe("streetLine1");
    expect(schema.deliveryInfo.referenceNote.name).toBe("referenceNote");
    expect(schema.customerAddress.streetLine1.name).toBe("streetLine1");
    expect(schema.customerAddress.isDefault.name).toBe("isDefault");
    expect(schema.deliveryInfo.notes.name).toBe("notes");
    expect("fulfillmentType" in schema.order).toBe(false);
    expect("note" in schema.order).toBe(false);
  });
});
