import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { isGoogleAuthEnabledMock } = vi.hoisted(() => ({
  isGoogleAuthEnabledMock: vi.fn(),
}));

vi.mock("@repo/auth/keys", () => ({
  isGoogleAuthEnabled: isGoogleAuthEnabledMock,
}));

vi.mock("../app/(unauthenticated)/components/sign-in-form", () => ({
  SignInForm: ({ googleEnabled }: { googleEnabled?: boolean }) => (
    <div>sign-in-form:{String(googleEnabled)}</div>
  ),
}));

import Page from "../app/(unauthenticated)/sign-in/[[...sign-in]]/page";

test("Sign In Page", () => {
  isGoogleAuthEnabledMock.mockReturnValue(false);

  render(<Page />);

  expect(screen.getByText("sign-in-form:false")).toBeDefined();
});
