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

    fireEvent.change(screen.getByLabelText("Nombre del comercio"), {
      target: { value: "Tienda Centro" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByLabelText("Tu nombre")).toBeDefined();
    expect(screen.getByLabelText("Email de trabajo")).toBeDefined();
    expect(screen.getByLabelText("Contrasena")).toBeDefined();
  });

  test("shows Google only when enabled", () => {
    const { rerender } = render(<SignUpForm googleEnabled={false} />);

    expect(
      screen.queryByRole("button", { name: "Continue with Google" })
    ).toBeNull();

    rerender(<SignUpForm googleEnabled />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeDefined();
  });

  test("renders bootstrap failure inline after account submission", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "No se pudo crear el comercio." }),
    });

    render(<SignUpForm googleEnabled={false} />);

    fireEvent.change(screen.getByLabelText("Nombre del comercio"), {
      target: { value: "Tienda Centro" },
    });
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

    await waitFor(() =>
      expect(screen.getByText("No se pudo crear el comercio.")).toBeDefined()
    );

    expect(signUpEmailMock).toHaveBeenCalledWith({
      callbackURL: "/",
      email: "owner@example.com",
      name: "Sebastian",
      password: "supersecret",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/bootstrap", {
      body: JSON.stringify({ commerceName: "Tienda Centro" }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
