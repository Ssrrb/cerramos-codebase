import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("next/navigation", () => {
  const push = vi.fn();
  const refresh = vi.fn();

  return {
    __mocks: { push, refresh },
    useRouter: () => ({
      push,
      refresh,
    }),
  };
});

vi.mock("@repo/auth/client", () => {
  const signOut = vi.fn();

  return {
    __mocks: { signOut },
    signOut,
  };
});

vi.mock("./ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    disabled,
    onClick,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("./ui/sidebar", () => ({
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

import * as authClientModule from "@repo/auth/client";
import * as nextNavigationModule from "next/navigation";
import SidebarAccountMenu from "./sidebar-account-menu";

const navigationMocks = (
  nextNavigationModule as typeof nextNavigationModule & {
    __mocks: {
      push: ReturnType<typeof vi.fn>;
      refresh: ReturnType<typeof vi.fn>;
    };
  }
).__mocks;

const authClientMocks = (
  authClientModule as typeof authClientModule & {
    __mocks: {
      signOut: ReturnType<typeof vi.fn>;
    };
  }
).__mocks;

describe("sidebar account menu", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigationMocks.push.mockReset();
    navigationMocks.refresh.mockReset();
    authClientMocks.signOut.mockReset();
    authClientMocks.signOut.mockResolvedValue(undefined);
  });

  test("renders the session user's name and email", () => {
    render(
      <SidebarAccountMenu
        activeCommerce={{
          name: "Tienda Centro",
          role: "merchant_admin",
          slug: "tienda-centro",
        }}
        user={{ email: "owner@example.com", name: "Sebastian" }}
      />
    );

    expect(screen.getAllByText("Sebastian")).toHaveLength(2);
    expect(screen.getByText("owner@example.com")).toBeDefined();
    expect(screen.getByText("Tienda Centro")).toBeDefined();
    expect(screen.getByText("Tienda Centro / tienda-centro")).toBeDefined();
  });

  test("signs out and redirects to sign-in", async () => {
    render(
      <SidebarAccountMenu
        activeCommerce={{
          name: "Tienda Centro",
          role: "merchant_admin",
          slug: "tienda-centro",
        }}
        user={{ email: "owner@example.com", name: "Sebastian" }}
      />
    );

    fireEvent.click(screen.getByText("Sign out"));

    await waitFor(() => expect(authClientMocks.signOut).toHaveBeenCalled());
    expect(navigationMocks.push).toHaveBeenCalledWith("/sign-in");
    expect(navigationMocks.refresh).toHaveBeenCalled();
  });
});
