import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { isGoogleAuthEnabledMock } = vi.hoisted(() => ({
  isGoogleAuthEnabledMock: vi.fn(),
}));

vi.mock("@repo/auth/keys", () => ({
  isGoogleAuthEnabled: isGoogleAuthEnabledMock,
}));

vi.mock("../app/(unauthenticated)/components/sign-up-form", () => ({
  SignUpForm: ({ googleEnabled }: { googleEnabled?: boolean }) => (
    <div>sign-up-form:{String(googleEnabled)}</div>
  ),
}));

import Page from "../app/(unauthenticated)/sign-up/[[...sign-up]]/page";

test("Sign Up Page", () => {
  isGoogleAuthEnabledMock.mockReturnValue(true);

  render(<Page />);

  expect(screen.getByText("sign-up-form:true")).toBeDefined();
});
