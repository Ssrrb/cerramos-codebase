// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../app/node_modules/@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CheckoutAuthAction } from "./checkout-auth-action";

const {
  pushMock,
  refreshMock,
  signInEmailMock,
  signInSocialMock,
  signUpEmailMock,
  useSessionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInEmailMock: vi.fn(),
  signInSocialMock: vi.fn(),
  signUpEmailMock: vi.fn(),
  useSessionMock: vi.fn(),
}));

vi.mock("@repo/auth/client", () => ({
  signIn: {
    email: signInEmailMock,
    social: signInSocialMock,
  },
  signUp: {
    email: signUpEmailMock,
  },
  useSession: useSessionMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/buy/mate-shop/mate-premium",
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("CheckoutAuthAction", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInEmailMock.mockReset();
    signInSocialMock.mockReset();
    signUpEmailMock.mockReset();
    useSessionMock.mockReset();

    useSessionMock.mockReturnValue({
      data: null,
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: vi.fn(),
    });
    signInEmailMock.mockResolvedValue({
      data: {
        url: "/en/buy/mate-shop/mate-premium",
      },
      error: null,
    });
    signInSocialMock.mockResolvedValue({ error: null });
    signUpEmailMock.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  test("submits email sign-in against the current checkout path", async () => {
    render(<CheckoutAuthAction googleEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "buyer@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue with Email" }));
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith({
        callbackURL: "/en/buy/mate-shop/mate-premium",
        email: "buyer@example.com",
        password: "secret-123",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/en/buy/mate-shop/mate-premium");
    expect(refreshMock).toHaveBeenCalled();
  });

  test("switches to sign-up mode and registers against the current checkout path", async () => {
    render(<CheckoutAuthAction googleEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));
    fireEvent.change(screen.getByLabelText("Tu nombre"), {
      target: { value: "Buyer Name" },
    });
    fireEvent.change(screen.getByLabelText("Email de trabajo"), {
      target: { value: "buyer@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contrasena"), {
      target: { value: "secret-123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(signUpEmailMock).toHaveBeenCalledWith({
        callbackURL: "/en/buy/mate-shop/mate-premium",
        email: "buyer@example.com",
        name: "Buyer Name",
        password: "secret-123",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/en/buy/mate-shop/mate-premium");
    expect(refreshMock).toHaveBeenCalled();
  });

  test("uses the checkout path for Google sign-in", async () => {
    render(<CheckoutAuthAction googleEnabled />);

    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    await waitFor(() => {
      expect(signInSocialMock).toHaveBeenCalledWith({
        callbackURL: "/en/buy/mate-shop/mate-premium",
        newUserCallbackURL: "/en/buy/mate-shop/mate-premium",
        provider: "google",
      });
    });
  });

  test("shows the active buyer when a session already exists", () => {
    useSessionMock.mockReturnValue({
      data: {
        user: {
          email: "buyer@example.com",
          name: "Buyer Name",
        },
      },
      error: null,
      isPending: false,
      isRefetching: false,
      refetch: vi.fn(),
    });

    render(<CheckoutAuthAction />);

    expect(screen.getByText("Buyer Name")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Ingresar" })).toBeNull();
  });

  test("does not loop when useSession returns a fresh user object every render", () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      useSessionMock.mockImplementation(() => ({
        data: {
          user: {
            email: "buyer@example.com",
            name: "Buyer Name",
          },
        },
        error: null,
        isPending: false,
        isRefetching: false,
        refetch: vi.fn(),
      }));

      render(<CheckoutAuthAction />);

      expect(screen.getByText("Buyer Name")).toBeDefined();
      expect(
        consoleErrorMock.mock.calls.some((call) =>
          call.some(
            (argument) =>
              typeof argument === "string" &&
              argument.includes("Maximum update depth exceeded")
          )
        )
      ).toBe(false);
    } finally {
      consoleErrorMock.mockRestore();
    }
  });
});
