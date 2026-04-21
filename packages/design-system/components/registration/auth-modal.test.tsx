import { afterEach, describe, expect, test, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { AuthModal } from "./auth-modal";

describe("auth modal", () => {
  afterEach(() => {
    cleanup();
  });

  test("shows the Google sign-in option in sign-in mode", () => {
    render(<AuthModal isOpen onClose={vi.fn()} type="sign-in" />);

    expect(
      screen.getByRole("button", { name: "Continue with Google" })
    ).toBeDefined();
  });
});
