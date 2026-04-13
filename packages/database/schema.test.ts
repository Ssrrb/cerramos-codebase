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
});
