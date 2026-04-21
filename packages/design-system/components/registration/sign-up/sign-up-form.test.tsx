import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { SignUpFormView } from "./sign-up-form";

const {
  onBackMock,
  onEmailChangeMock,
  onGoogleClickMock,
  onNameChangeMock,
  onPasswordChangeMock,
  onSubmitMock,
  onUsageChangeMock,
} = vi.hoisted(() => ({
  onBackMock: vi.fn(),
  onEmailChangeMock: vi.fn(),
  onGoogleClickMock: vi.fn(),
  onNameChangeMock: vi.fn(),
  onPasswordChangeMock: vi.fn(),
  onSubmitMock: vi.fn((event?: { preventDefault?: () => void }) =>
    event?.preventDefault?.()
  ),
  onUsageChangeMock: vi.fn(),
}));

describe("sign-up form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    onBackMock.mockReset();
    onEmailChangeMock.mockReset();
    onGoogleClickMock.mockReset();
    onNameChangeMock.mockReset();
    onPasswordChangeMock.mockReset();
    onSubmitMock.mockClear();
    onUsageChangeMock.mockReset();
  });

  test("moves from setup step to account step", () => {
    const { rerender } = render(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="setup"
        usage="business"
      />
    );

    expect(screen.queryByLabelText("Tu nombre")).toBeNull();

    rerender(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="account"
        usage="business"
      />
    );

    expect(screen.queryByLabelText("Nombre del comercio")).toBeNull();
    expect(screen.getByLabelText("Tu nombre")).toBeDefined();
    expect(screen.getByLabelText("Email de trabajo")).toBeDefined();
    expect(screen.getByLabelText("Contrasena")).toBeDefined();
  });

  test("shows Google only when enabled", () => {
    const { rerender } = render(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        googleEnabled={false}
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="account"
        usage="business"
      />
    );

    expect(
      screen.queryByRole("button", { name: "Continuar con Google" })
    ).toBeNull();

    rerender(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        googleEnabled
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="account"
        usage="business"
      />
    );

    expect(
      screen.getByRole("button", { name: "Continuar con Google" })
    ).toBeDefined();
  });

  test("forwards account and setup actions through props", () => {
    const { rerender } = render(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="setup"
        usage="business"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onSubmitMock).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("radio", { name: /trabajo en proyectos personales/i })
    );
    expect(onUsageChangeMock).toHaveBeenCalledWith("explore");

    rerender(
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        error="No se pudo crear la cuenta."
        googleEnabled
        name=""
        onBack={onBackMock}
        onEmailChange={onEmailChangeMock}
        onGoogleClick={onGoogleClickMock}
        onNameChange={onNameChangeMock}
        onPasswordChange={onPasswordChangeMock}
        onSubmit={onSubmitMock}
        onUsageChange={onUsageChangeMock}
        password=""
        step="account"
        usage="business"
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Continuar con Google" })
    );
    fireEvent.change(screen.getByLabelText("Tu nombre"), {
      target: { value: "Sebastian" },
    });
    fireEvent.change(screen.getByLabelText("Email de trabajo"), {
      target: { value: "owner@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contrasena"), {
      target: { value: "supersecret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("No se pudo crear la cuenta.")).toBeDefined();
    expect(onGoogleClickMock).toHaveBeenCalled();
    expect(onNameChangeMock).toHaveBeenCalledWith("Sebastian");
    expect(onEmailChangeMock).toHaveBeenCalledWith("owner@example.com");
    expect(onPasswordChangeMock).toHaveBeenCalledWith("supersecret");
    expect(onSubmitMock).toHaveBeenCalledTimes(2);
    expect(onBackMock).toHaveBeenCalled();
  });
});
