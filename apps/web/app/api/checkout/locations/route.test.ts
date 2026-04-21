import { beforeEach, describe, expect, test, vi } from "vitest";

const { getCheckoutLocationDataMock } = vi.hoisted(() => ({
  getCheckoutLocationDataMock: vi.fn(),
}));

vi.mock("@/lib/checkout-locations", () => ({
  getCheckoutLocationData: getCheckoutLocationDataMock,
}));

describe("GET /api/checkout/locations", () => {
  beforeEach(() => {
    getCheckoutLocationDataMock.mockReset();
  });

  test("returns DB-backed checkout location options", async () => {
    getCheckoutLocationDataMock.mockResolvedValueOnce({
      cities: [
        {
          label: "Asunción",
          stateId: "state_db_asuncion",
          value: "city_db_asuncion",
        },
      ],
      countries: [
        {
          label: "Paraguay",
          value: "country_db_py",
        },
      ],
      states: [
        {
          countryId: "country_db_py",
          label: "Asunción",
          value: "state_db_asuncion",
        },
      ],
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      cities: [
        {
          label: "Asunción",
          stateId: "state_db_asuncion",
          value: "city_db_asuncion",
        },
      ],
      countries: [
        {
          label: "Paraguay",
          value: "country_db_py",
        },
      ],
      states: [
        {
          countryId: "country_db_py",
          label: "Asunción",
          value: "state_db_asuncion",
        },
      ],
    });
  });

  test("returns 500 when checkout locations cannot be loaded", async () => {
    getCheckoutLocationDataMock.mockRejectedValueOnce(new Error("db failed"));

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "No se pudieron cargar las ubicaciones de entrega.",
    });
  });
});
