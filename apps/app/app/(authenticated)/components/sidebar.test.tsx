import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { GlobalSidebar } from "./sidebar";

const pathnameMock = vi.fn();

globalThis.matchMedia =
  globalThis.matchMedia ||
  vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

vi.mock("@repo/auth/client", () => ({
  OrganizationSwitcher: () => <div>OrganizationSwitcher</div>,
  UserButton: () => <div>UserButton</div>,
}));

vi.mock("@repo/design-system/components/mode-toggle", () => ({
  ModeToggle: () => <button type="button">ModeToggle</button>,
}));

vi.mock("@repo/notifications/components/trigger", () => ({
  NotificationsTrigger: () => <button type="button">Notifications</button>,
}));

const renderSidebar = (pathname: string) => {
  pathnameMock.mockReturnValue(pathname);

  return render(
    <SidebarProvider>
      <GlobalSidebar>
        <div>Contenido</div>
      </GlobalSidebar>
    </SidebarProvider>
  );
};

describe("GlobalSidebar", () => {
  test("marks catálogo as active on the root route", () => {
    renderSidebar("/");

    expect(
      screen.getByText("Productos").closest("[data-active='true']")
    ).toBeTruthy();
    expect(
      screen.getByText("Catálogo").closest("[data-active='true']")
    ).toBeTruthy();
  });

  test("marks búsqueda as active on the search route and keeps products expanded", () => {
    renderSidebar("/search");

    expect(
      screen
        .getAllByText("Búsqueda")
        .some((element) => Boolean(element.closest("[data-active='true']")))
    ).toBe(true);
    expect(screen.getAllByText("Buscar").length).toBeGreaterThan(0);
  });

  test("marks webhooks as active on the webhooks route and keeps products expanded", () => {
    renderSidebar("/webhooks");

    expect(
      screen
        .getAllByText("Webhooks")
        .some((element) => Boolean(element.closest("[data-active='true']")))
    ).toBe(true);
    expect(screen.getAllByText("Webhooks").length).toBeGreaterThan(1);
  });
});
