import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const {
  fetchMock,
  pushMock,
  refreshMock,
  resizeObserverMock,
  signInSocialMock,
  signUpEmailMock,
} = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  resizeObserverMock: class ResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  },
  signInSocialMock: vi.fn(),
  signUpEmailMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal("ResizeObserver", resizeObserverMock);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@repo/auth/client", () => ({
  signIn: {
    social: signInSocialMock,
  },
  signUp: {
    email: signUpEmailMock,
  },
}));

vi.mock("@repo/design-system/components/registration", () => ({
  SignUpFormView: ({
    email,
    error,
    googleEnabled,
    name,
    onBack,
    onEmailChange,
    onGoogleClick,
    onNameChange,
    onPasswordChange,
    onSubmit,
    onUsageChange,
    password,
    step,
    usage,
  }: {
    email: string;
    error?: string | null;
    googleEnabled?: boolean;
    name: string;
    onBack: () => void;
    onEmailChange: (value: string) => void;
    onGoogleClick: () => void;
    onNameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onUsageChange: (value: "business" | "explore") => void;
    password: string;
    step: "setup" | "account";
    usage: "business" | "explore";
  }) => (
    <form onSubmit={onSubmit}>
      {step === "setup" ? (
        <>
          <label>
            Trabajo en proyectos comerciales
            <input
              checked={usage === "business"}
              name="usage"
              onChange={() => onUsageChange("business")}
              type="radio"
            />
          </label>
          <label>
            Trabajo en proyectos personales
            <input
              checked={usage === "explore"}
              name="usage"
              onChange={() => onUsageChange("explore")}
              type="radio"
            />
          </label>
          <button type="submit">Continue</button>
        </>
      ) : (
        <>
          <label>
            Tu nombre
            <input
              aria-label="Tu nombre"
              onChange={(event) => onNameChange(event.target.value)}
              value={name}
            />
          </label>
          <label>
            Email de trabajo
            <input
              aria-label="Email de trabajo"
              onChange={(event) => onEmailChange(event.target.value)}
              value={email}
            />
          </label>
          <label>
            Contrasena
            <input
              aria-label="Contrasena"
              onChange={(event) => onPasswordChange(event.target.value)}
              value={password}
            />
          </label>
          {error ? <p>{error}</p> : null}
          {googleEnabled ? (
            <button onClick={onGoogleClick} type="button">
              Continuar con Google
            </button>
          ) : null}
          <button onClick={onBack} type="button">
            Back
          </button>
          <button type="submit">Create Account</button>
        </>
      )}
    </form>
  ),
}));

import { SignUpForm } from "./sign-up-form";

describe("sign-up form", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    fetchMock.mockReset();
    pushMock.mockReset();
    refreshMock.mockReset();
    signInSocialMock.mockReset();
    signUpEmailMock.mockReset();
    signInSocialMock.mockResolvedValue({ error: null });
    signUpEmailMock.mockResolvedValue({ error: null });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  test("moves from setup step to account step", () => {
    render(<SignUpForm googleEnabled={false} />);

    expect(screen.queryByLabelText("Tu nombre")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.queryByLabelText("Nombre del comercio")).toBeNull();
    expect(screen.getByLabelText("Tu nombre")).toBeDefined();
    expect(screen.getByLabelText("Email de trabajo")).toBeDefined();
    expect(screen.getByLabelText("Contrasena")).toBeDefined();
  });

  test("shows Google only when enabled", () => {
    const { rerender } = render(<SignUpForm googleEnabled={false} />);

    expect(
      screen.queryByRole("button", { name: "Continuar con Google" })
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.queryByRole("button", { name: "Continuar con Google" })
    ).toBeNull();

    rerender(<SignUpForm googleEnabled />);

    expect(
      screen.getByRole("button", { name: "Continuar con Google" })
    ).toBeDefined();
  });

  test("routes email sign-up into onboarding", async () => {
    render(<SignUpForm googleEnabled={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

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

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding"));

    expect(signUpEmailMock).toHaveBeenCalledWith({
      callbackURL: "/",
      email: "owner@example.com",
      name: "Sebastian",
      password: "supersecret",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });
});
