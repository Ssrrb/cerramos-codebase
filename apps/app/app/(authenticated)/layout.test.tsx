import { render, screen } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, expect, test, vi } from "vitest";

const { cookiesMock, requireCommerceContextMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  requireCommerceContextMock: vi.fn(),
}));

vi.mock("./globals.css", () => ({}));

vi.mock("@repo/auth/server", () => ({
  requireCommerceContext: requireCommerceContextMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/app/components/app-sidebar", () => ({
  default: ({
    activeCommerce,
    user,
  }: {
    activeCommerce: { logoImageUrl?: string | null; name: string; slug: string };
    user: { email: string };
  }) => (
    <div data-testid="sidebar">
      {user.email}:{activeCommerce.name}:{activeCommerce.slug}:{activeCommerce.logoImageUrl ?? ""}
    </div>
  ),
}));

vi.mock("@/app/components/Navbar", () => ({
  default: ({
    activeCommerce,
  }: {
    activeCommerce: { name: string; slug: string };
  }) => (
    <div data-testid="navbar">
      {activeCommerce.name}:{activeCommerce.slug}
    </div>
  ),
}));

vi.mock("@/app/components/providers/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/app/components/ui/sidebar", () => ({
  SidebarProvider: ({
    children,
    defaultOpen,
  }: {
    children: ReactNode;
    defaultOpen?: boolean;
  }) => (
    <div data-testid="sidebar-provider">
      {String(defaultOpen)}:{children}
    </div>
  ),
}));

beforeEach(() => {
  vi.resetModules();
  cookiesMock.mockReset();
  requireCommerceContextMock.mockReset();
});

test("uses authenticated commerce context to render the shell", async () => {
  cookiesMock.mockResolvedValue({
    get: vi.fn(() => ({ value: "true" })),
  });
  requireCommerceContextMock.mockResolvedValue({
    commerce: {
      id: "commerce_1",
      logoImageUrl: "https://cdn.example.com/logo.png",
      name: "Tienda Centro",
      role: "merchant_admin",
      slug: "tienda-centro",
    },
    orgId: "commerce_1",
    user: {
      email: "owner@example.com",
      id: "user_1",
      image: null,
      name: "Sebastian",
      role: "merchant_admin",
    },
  });

  const { default: RootLayout } = await import("./layout");

  render(await RootLayout({ children: <div>content</div> }));

  expect(screen.getByTestId("sidebar").textContent).toContain(
    "owner@example.com:Tienda Centro:tienda-centro:https://cdn.example.com/logo.png"
  );
  expect(screen.getByTestId("navbar").textContent).toContain(
    "Tienda Centro:tienda-centro"
  );
  expect(screen.getByTestId("sidebar-provider").textContent).toContain("true");
});
