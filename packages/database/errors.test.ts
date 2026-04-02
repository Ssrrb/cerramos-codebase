import { describe, expect, test } from "vitest";
import {
  isForeignKeyConstraintError,
  isMissingRelationError,
  isUniqueConstraintError,
} from "./errors";

describe("isMissingRelationError", () => {
  test("detects undefined table errors for the requested relation", () => {
    expect(
      isMissingRelationError(
        {
          cause: {
            code: "42P01",
            message: 'relation "ProductLink" does not exist',
          },
          query: 'select * from "ProductLink"',
        },
        "ProductLink"
      )
    ).toBe(true);
  });

  test("ignores undefined table errors for other relations", () => {
    expect(
      isMissingRelationError(
        {
          cause: {
            code: "42P01",
            message: 'relation "Order" does not exist',
          },
          query: 'select * from "Order"',
        },
        "ProductLink"
      )
    ).toBe(false);
  });
});

describe("isUniqueConstraintError", () => {
  test("detects unique violations for the requested constraint", () => {
    expect(
      isUniqueConstraintError(
        {
          cause: {
            code: "23505",
            constraint: "ProductLink_productId_key",
          },
          detail: 'Key ("productId")=(product_1) already exists.',
        },
        "ProductLink_productId_key"
      )
    ).toBe(true);
  });

  test("ignores unique violations for other constraints", () => {
    expect(
      isUniqueConstraintError(
        {
          cause: {
            code: "23505",
            constraint: "ProductLink_commerceId_slug_key",
          },
        },
        "ProductLink_productId_key"
      )
    ).toBe(false);
  });
});

describe("isForeignKeyConstraintError", () => {
  test("detects wrapped foreign key violations", () => {
    expect(
      isForeignKeyConstraintError({
        cause: {
          code: "23503",
          constraint: "ProductLink_productId_commerceId_Product_id_commerceId_fk",
        },
      })
    ).toBe(true);
  });

  test("ignores other database errors", () => {
    expect(
      isForeignKeyConstraintError({
        cause: {
          code: "23505",
        },
      })
    ).toBe(false);
  });
});
