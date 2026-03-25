import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  getSessionMock,
  insertMock,
  insertReturningMock,
  insertValuesMock,
  selectFromMock,
  selectLimitMock,
  selectMock,
  selectWhereMock,
  updateMock,
  updateSetMock,
  updateWhereMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  insertMock: vi.fn(),
  insertReturningMock: vi.fn(),
  insertValuesMock: vi.fn(),
  selectFromMock: vi.fn(),
  selectLimitMock: vi.fn(),
  selectMock: vi.fn(),
  selectWhereMock: vi.fn(),
  updateMock: vi.fn(),
  updateSetMock: vi.fn(),
  updateWhereMock: vi.fn(),
}));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
}));

vi.mock("@repo/database", () => ({
  database: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
  },
  schema: {
    commerce: {
      id: "commerce.id",
      slug: "commerce.slug",
    },
    user: {
      id: "user.id",
    },
  },
}));

describe("auth bootstrap route", () => {
  beforeEach(() => {
    vi.resetModules();
    getSessionMock.mockReset();
    insertMock.mockReset();
    insertReturningMock.mockReset();
    insertValuesMock.mockReset();
    selectFromMock.mockReset();
    selectLimitMock.mockReset();
    selectMock.mockReset();
    selectWhereMock.mockReset();
    updateMock.mockReset();
    updateSetMock.mockReset();
    updateWhereMock.mockReset();

    selectMock.mockImplementation(() => ({
      from: selectFromMock,
    }));
    selectFromMock.mockImplementation(() => ({
      where: selectWhereMock,
    }));
    selectWhereMock.mockImplementation(() => ({
      limit: selectLimitMock,
    }));
    insertMock.mockImplementation(() => ({
      values: insertValuesMock,
    }));
    insertValuesMock.mockImplementation(() => ({
      returning: insertReturningMock,
    }));
    updateMock.mockImplementation(() => ({
      set: updateSetMock,
    }));
    updateSetMock.mockImplementation(() => ({
      where: updateWhereMock,
    }));
  });

  test("creates a commerce and assigns it to the current user", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        commerceId: null,
        id: "user_1",
      },
    });
    selectLimitMock.mockResolvedValue([]);
    insertReturningMock.mockResolvedValue([
      {
        id: "commerce_1",
        slug: "tienda-centro",
      },
    ]);
    updateWhereMock.mockResolvedValue(undefined);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap", {
        body: JSON.stringify({ commerceName: "Tienda Centro" }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    await expect(response.json()).resolves.toEqual({
      commerceId: "commerce_1",
      slug: "tienda-centro",
    });
    expect(insertValuesMock).toHaveBeenCalledWith({
      name: "Tienda Centro",
      slug: "tienda-centro",
    });
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        commerceId: "commerce_1",
        role: "merchant_admin",
        updatedAt: expect.any(Date),
      })
    );
  });
});
