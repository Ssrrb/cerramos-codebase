// @vitest-environment jsdom

import { afterEach, describe, expect, test } from "vitest";
import {
  cleanup,
  render,
  screen,
} from "../../../../../app/node_modules/@testing-library/react";
import { CustomerAddressesPageClient } from "./page-client";

const addressSummary = {
  cityId: "city_db_asuncion",
  countryId: "country_db_py",
  id: "address_1",
  isDefault: true,
  label: "Casa",
  phone: "0981000000",
  postalCode: "1000",
  recipientName: "Buyer Name",
  referenceNote: "Portón negro",
  stateId: "state_db_asuncion",
  streetLine1: "Av. España 742",
  streetLine2: null,
  summary: "Av. España 742, Asunción",
};

afterEach(() => {
  cleanup();
});

describe("CustomerAddressesPageClient", () => {
  test("renders a back-to-checkout action when a return target is present", () => {
    render(
      <CustomerAddressesPageClient
        initialAddresses={[addressSummary]}
        returnToHref="/es/buy/mate-shop/mate-premium?color=verde"
      />
    );

    expect(
      screen
        .getByRole("link", { name: "Volver al checkout" })
        .getAttribute("href")
    ).toBe("/es/buy/mate-shop/mate-premium?color=verde");
  });

  test("omits the back-to-checkout action without a return target", () => {
    render(<CustomerAddressesPageClient initialAddresses={[addressSummary]} />);

    expect(
      screen.queryByRole("link", { name: "Volver al checkout" })
    ).toBeNull();
  });
});
