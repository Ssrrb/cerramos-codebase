import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { pushMock, refreshMock, signInEmailMock, signInSocialMock } = vi.hoisted(
  () => ({
    pushMock: vi.fn(),
    refreshMock: vi.fn(),
    signInEmailMock: vi.fn(),
    signInSocialMock: vi.fn(),
  })
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@repo/auth/client", () => ({
  signIn: {
    email: signInEmailMock,
    social: signInSocialMock,
  },
}));

import { SignInForm } from "./sign-in-form";

describe("sign-in form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInEmailMock.mockReset();
    signInSocialMock.mockReset();
    signInEmailMock.mockResolvedValue({ data: { url: "/" }, error: null });
    signInSocialMock.mockResolvedValue({ error: null });
  });

  test("reveals password only after continuing with email", () => {
    render(<SignInForm googleEnabled={false} />);

    expect(screen.queryByPlaceholderText("Password")).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Email" })
    );

    expect(screen.getByPlaceholderText("Password")).toBeDefined();
    expect(signInEmailMock).not.toHaveBeenCalled();
  });

  test("shows Google only when enabled", () => {
    const { rerender } = render(<SignInForm googleEnabled={false} />);

    expect(
      screen.queryByRole("button", { name: "Continue with Google" })
    ).toBeNull();

    rerender(<SignInForm googleEnabled />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeDefined();
  });

  test("renders inline error when email sign-in fails", async () => {
    signInEmailMock.mockResolvedValue({
      data: null,
      error: { message: "Credenciales invalidas" },
    });

    render(<SignInForm googleEnabled={false} />);

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Email" })
    );
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "bad-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(screen.getByText("Credenciales invalidas")).toBeDefined()
    );

    expect(signInEmailMock).toHaveBeenCalledWith({
      callbackURL: "/",
      email: "owner@example.com",
      password: "bad-password",
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
