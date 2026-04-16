import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SignInFormView } from "./sign-in-form";

const {
  onEmailChangeMock,
  onGoogleClickMock,
  onPasswordChangeMock,
  onSubmitMock,
  onUseDifferentEmailMock,
} = vi.hoisted(() => ({
  onEmailChangeMock: vi.fn(),
  onGoogleClickMock: vi.fn(),
  onPasswordChangeMock: vi.fn(),
  onSubmitMock: vi.fn((event?: { preventDefault?: () => void }) =>
    event?.preventDefault?.()
  ),
  onUseDifferentEmailMock: vi.fn(),
}));

describe("sign-in form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    onEmailChangeMock.mockReset();
    onGoogleClickMock.mockReset();
    onPasswordChangeMock.mockReset();
    onSubmitMock.mockClear();
    onUseDifferentEmailMock.mockReset();
  });

  test("reveals password only after continuing with email", () => {
    const { rerender } = render(
      <SignInFormView
        callbackHref="/sign-up"
        email=""
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUseDifferentEmail={onUseDifferentEmailMock}
        password=""
        step="email"
      />
    );

    expect(screen.queryByPlaceholderText("Password")).toBeNull();

    rerender(
      <SignInFormView
        callbackHref="/sign-up"
        email="owner@example.com"
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUseDifferentEmail={onUseDifferentEmailMock}
        password=""
        step="password"
      />
    );

    expect(screen.getByPlaceholderText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Log In" })).toBeDefined();
  });

  test("shows Google only when enabled", () => {
    const { rerender } = render(
      <SignInFormView
        callbackHref="/sign-up"
        email=""
        googleEnabled={false}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUseDifferentEmail={onUseDifferentEmailMock}
        password=""
        step="email"
      />
    );

    expect(
      screen.queryByRole("button", { name: "Continue with Google" })
    ).toBeNull();

    rerender(
      <SignInFormView
        callbackHref="/sign-up"
        email=""
        googleEnabled
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUseDifferentEmail={onUseDifferentEmailMock}
        password=""
        step="email"
      />
    );

    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeDefined();
  });

  test("forwards field and action events through props", () => {
    render(
      <SignInFormView
        callbackHref="/sign-up?returnTo=%2Fclientes%2F123"
        email=""
        error="Credenciales invalidas"
        googleEnabled
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUseDifferentEmail={onUseDifferentEmailMock}
        password="bad-password"
        step="password"
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "bad-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(screen.getByText("Credenciales invalidas")).toBeDefined();
    expect(onEmailChangeMock).toHaveBeenCalledWith("owner@example.com");
    expect(onPasswordChangeMock).toHaveBeenCalledWith("bad-password");
    expect(onUseDifferentEmailMock).toHaveBeenCalled();
    expect(onGoogleClickMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
