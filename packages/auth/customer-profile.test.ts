import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  fromMock,
  insertMock,
  insertReturningMock,
  insertValuesMock,
  limitMock,
  selectMock,
  setMock,
  updateReturningMock,
  updateMock,
  whereMock,
  updateWhereMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  insertMock: vi.fn(),
  insertReturningMock: vi.fn(),
  insertValuesMock: vi.fn(),
  limitMock: vi.fn(),
  selectMock: vi.fn(),
  setMock: vi.fn(),
  updateReturningMock: vi.fn(),
  updateMock: vi.fn(),
  whereMock: vi.fn(),
  updateWhereMock: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  database: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
  },
  isUniqueConstraintError: vi.fn((error: unknown, constraintName?: string) =>
    Boolean(
      error &&
        typeof error === "object" &&
        "constraint" in error &&
        constraintName &&
        (error as { constraint?: string }).constraint === constraintName
    )
  ),
  schema: {
    customerProfile: {
      email: "customerProfile.email",
      id: "customerProfile.id",
      image: "customerProfile.image",
      name: "customerProfile.name",
      updatedAt: "customerProfile.updatedAt",
      userId: "customerProfile.userId",
    },
    user: {
      customerId: "user.customerId",
      email: "user.email",
      id: "user.id",
      image: "user.image",
      name: "user.name",
      updatedAt: "user.updatedAt",
    },
  },
}));

vi.mock("@repo/observability/log", () => ({
  log: {
    warn: vi.fn(),
  },
}));

describe("syncCustomerProfileForUser", () => {
  beforeEach(() => {
    fromMock.mockReset();
    insertMock.mockReset();
    insertReturningMock.mockReset();
    insertValuesMock.mockReset();
    limitMock.mockReset();
    selectMock.mockReset();
    setMock.mockReset();
    updateReturningMock.mockReset();
    updateMock.mockReset();
    whereMock.mockReset();
    updateWhereMock.mockReset();

    selectMock.mockImplementation(() => ({
      from: fromMock,
    }));
    fromMock.mockImplementation(() => ({
      where: whereMock,
    }));
    whereMock.mockImplementation(() => ({
      limit: limitMock,
    }));
    insertMock.mockImplementation(() => ({
      values: insertValuesMock,
    }));
    insertValuesMock.mockImplementation(() => ({
      returning: insertReturningMock,
    }));
    updateMock.mockImplementation(() => ({
      set: setMock,
    }));
    setMock.mockImplementation(() => ({
      where: updateWhereMock,
    }));
  });

  test("adopts an existing guest customer profile by email", async () => {
    limitMock
      .mockResolvedValueOnce([
        {
          customerId: null,
          email: "buyer@example.com",
          id: "user_1",
          image: "https://example.com/avatar.png",
          name: "Buyer Name",
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          email: "buyer@example.com",
          id: "customer_1",
          image: null,
          name: "Guest Buyer",
          userId: null,
        },
      ]);
    updateWhereMock
      .mockImplementationOnce(() => ({
        returning: updateReturningMock,
      }))
      .mockResolvedValueOnce(undefined);
    updateReturningMock.mockResolvedValueOnce([
      {
        email: "buyer@example.com",
        id: "customer_1",
        image: "https://example.com/avatar.png",
        name: "Buyer Name",
        userId: "user_1",
      },
    ]);

    const { syncCustomerProfileForUser } = await import("./customer-profile");

    await expect(syncCustomerProfileForUser("user_1")).resolves.toMatchObject({
      id: "customer_1",
      userId: "user_1",
    });

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(setMock.mock.calls[0]?.[0]).toMatchObject({
      email: "buyer@example.com",
      name: "Buyer Name",
      userId: "user_1",
    });
    expect(setMock.mock.calls[1]?.[0]).toMatchObject({
      customerId: "customer_1",
    });
  });

  test("creates a new customer profile when the buyer has no existing record", async () => {
    limitMock
      .mockResolvedValueOnce([
        {
          customerId: null,
          email: "buyer@example.com",
          id: "user_1",
          image: null,
          name: "Buyer Name",
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    insertReturningMock.mockResolvedValueOnce([
      {
        email: "buyer@example.com",
        id: "customer_new",
        image: null,
        name: "Buyer Name",
        userId: "user_1",
      },
    ]);
    updateWhereMock.mockResolvedValueOnce(undefined);

    const { syncCustomerProfileForUser } = await import("./customer-profile");

    await expect(syncCustomerProfileForUser("user_1")).resolves.toMatchObject({
      id: "customer_new",
      userId: "user_1",
    });

    expect(insertValuesMock).toHaveBeenCalledWith({
      email: "buyer@example.com",
      image: null,
      name: "Buyer Name",
      userId: "user_1",
    });
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer_new",
      })
    );
  });

  test("re-reads the adopted customer profile after a concurrent unique email conflict", async () => {
    limitMock
      .mockResolvedValueOnce([
        {
          customerId: null,
          email: "buyer@example.com",
          id: "user_1",
          image: null,
          name: "Buyer Name",
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          email: "buyer@example.com",
          id: "customer_race",
          image: null,
          name: "Buyer Name",
          userId: "user_1",
        },
      ]);
    insertReturningMock.mockRejectedValueOnce({
      code: "23505",
      constraint: "CustomerProfile_email_key",
    });
    updateWhereMock.mockResolvedValueOnce(undefined);

    const { syncCustomerProfileForUser } = await import("./customer-profile");

    await expect(syncCustomerProfileForUser("user_1")).resolves.toMatchObject({
      id: "customer_race",
    });

    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "customer_race",
      })
    );
  });
});
