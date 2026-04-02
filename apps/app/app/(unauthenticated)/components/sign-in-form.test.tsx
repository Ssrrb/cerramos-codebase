import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  const signInEmail = vi.fn();
  const signInSocial = vi.fn();

  return {
    __mocks: { signInEmail, signInSocial },
    signIn: {
      email: signInEmail,
      social: signInSocial,
    },
  };
});

vi.mock("@repo/design-system/components/registration", () => ({
  SignInFormView: ({
    callbackHref,
    email,
    error,
    googleEnabled,
    onEmailChange,
    onGoogleClick,
    onPasswordChange,
    onSubmit,
    onUseDifferentEmail,
    password,
    step,
  }: {
    callbackHref: string;
    email: string;
    error?: string | null;
    googleEnabled?: boolean;
    onEmailChange: (value: string) => void;
    onGoogleClick: () => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onUseDifferentEmail: () => void;
    password: string;
    step: "email" | "password";
  }) => (
    <form onSubmit={onSubmit}>
      <input
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="Email Address"
        value={email}
      />
      {step === "password" ? (
        <>
          <input
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
            value={password}
          />
          <button onClick={onUseDifferentEmail} type="button">
            Edit
          </button>
        </>
      ) : null}
      {error ? <p>{error}</p> : null}
      {googleEnabled ? (
        <button onClick={onGoogleClick} type="button">
          Continue with Google
        </button>
      ) : null}
      <a href={callbackHref}>Sign Up</a>
      <button type="submit">
        {step === "password" ? "Log In" : "Continue with Email"}
      </button>
    </form>
  ),
}));

import * as authClientModule from "@repo/auth/client";
import * as nextNavigationModule from "next/navigation";
import { SignInForm } from "./sign-in-form";

const navigationMocks = (nextNavigationModule as typeof nextNavigationModule & {
  __mocks: {
    push: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };
}).__mocks;

const authClientMocks = (authClientModule as typeof authClientModule & {
  __mocks: {
    signInEmail: ReturnType<typeof vi.fn>;
    signInSocial: ReturnType<typeof vi.fn>;
  };
}).__mocks;

describe("sign-in form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigationMocks.push.mockReset();
    navigationMocks.refresh.mockReset();
    authClientMocks.signInEmail.mockReset();
    authClientMocks.signInSocial.mockReset();
    authClientMocks.signInEmail.mockResolvedValue({
      data: { url: "/" },
      error: null,
    });
    authClientMocks.signInSocial.mockResolvedValue({ error: null });
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
    expect(authClientMocks.signInEmail).not.toHaveBeenCalled();
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
    authClientMocks.signInEmail.mockResolvedValue({
      data: null,
      error: { message: "Credenciales invalidas" },
    });

    render(
      <SignInForm
        callbackUrl="/clientes/123?tab=orders"
        googleEnabled={false}
      />
    );

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

    expect(authClientMocks.signInEmail).toHaveBeenCalledWith({
      callbackURL: "/clientes/123?tab=orders",
      email: "owner@example.com",
      password: "bad-password",
    });
    expect(navigationMocks.push).not.toHaveBeenCalled();
  });

  test("falls back to the authenticated home when no callback url is provided", async () => {
    render(<SignInForm googleEnabled={false} />);

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Email" })
    );
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "supersecret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(authClientMocks.signInEmail).toHaveBeenCalledWith({
        callbackURL: "/",
        email: "owner@example.com",
        password: "supersecret",
      })
    );
    expect(navigationMocks.push).toHaveBeenCalledWith("/");
  });

  test("pushes the resolved callback destination after email sign-in", async () => {
    authClientMocks.signInEmail.mockResolvedValue({
      data: { url: "/clientes/123?tab=orders" },
      error: null,
    });

    render(
      <SignInForm
        callbackUrl="/clientes/123?tab=orders"
        googleEnabled={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Email" })
    );
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "supersecret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() =>
      expect(navigationMocks.push).toHaveBeenCalledWith(
        "/clientes/123?tab=orders"
      )
    );
    expect(navigationMocks.refresh).toHaveBeenCalled();
  });
});
