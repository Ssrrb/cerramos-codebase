import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  getCurrentCustomerProfileMock,
  getCustomerAddressesPageDataMock,
  requireSessionMock,
} = vi.hoisted(() => ({
  getCurrentCustomerProfileMock: vi.fn(),
  getCustomerAddressesPageDataMock: vi.fn(),
  requireSessionMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  getCurrentCustomerProfile: getCurrentCustomerProfileMock,
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/customer-addresses", () => ({
  getCustomerAddressesPageData: getCustomerAddressesPageDataMock,
}));

vi.mock("./page-client", () => ({
  CustomerAddressesPageClient: (props: Record<string, unknown>) => (
    <pre>{JSON.stringify(props)}</pre>
  ),
}));

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

describe("customer direcciones page route", () => {
  beforeEach(() => {
    vi.resetModules();
    getCurrentCustomerProfileMock.mockReset();
    getCustomerAddressesPageDataMock.mockReset();
    requireSessionMock.mockReset();
    requireSessionMock.mockResolvedValue({
      user: {
        customerId: null,
        id: "user_1",
      },
    });
    getCurrentCustomerProfileMock.mockResolvedValue(null);
    getCustomerAddressesPageDataMock.mockResolvedValue([addressSummary]);
  });

  test("loads addresses with the current customer profile id", async () => {
    getCurrentCustomerProfileMock.mockResolvedValue({
      id: "customer_profile_1",
    });

    const { default: CustomerAddressesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerAddressesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(getCustomerAddressesPageDataMock).toHaveBeenCalledWith(
      "customer_profile_1"
    );
    expect(html).toContain("address_1");
  });

  test("falls back to the session customer id when no profile is found", async () => {
    requireSessionMock.mockResolvedValue({
      user: {
        customerId: "session_customer_1",
        id: "user_1",
      },
    });

    const { default: CustomerAddressesRoute } = await import("./page");
    renderToStaticMarkup(
      await CustomerAddressesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(getCustomerAddressesPageDataMock).toHaveBeenCalledWith(
      "session_customer_1"
    );
  });

  test("renders an empty address list when no customer id can be resolved", async () => {
    const { default: CustomerAddressesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerAddressesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(getCustomerAddressesPageDataMock).not.toHaveBeenCalled();
    expect(html).toContain("&quot;initialAddresses&quot;:[]");
  });

  test("renders the error state when data loading fails", async () => {
    getCurrentCustomerProfileMock.mockResolvedValue({
      id: "customer_profile_1",
    });
    getCustomerAddressesPageDataMock.mockRejectedValue(new Error("db failure"));

    const { default: CustomerAddressesRoute } = await import("./page");
    const html = renderToStaticMarkup(
      await CustomerAddressesRoute({
        params: Promise.resolve({ locale: "es" }),
      })
    );

    expect(html).toContain("Hubo un problema al recuperar tu cuenta");
    expect(html).toContain("Volver a intentar");
  });
});
