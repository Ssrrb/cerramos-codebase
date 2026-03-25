import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { getSessionMock, isGoogleAuthEnabledMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  isGoogleAuthEnabledMock: vi.fn(),
}));

vi.mock("@repo/auth/keys", () => ({
  isGoogleAuthEnabled: isGoogleAuthEnabledMock,
}));

vi.mock("@repo/auth/server", () => ({
  getSession: getSessionMock,
}));

vi.mock("../app/(unauthenticated)/components/sign-in-form", () => ({
  SignInForm: ({ googleEnabled }: { googleEnabled?: boolean }) => (
    <div>sign-in-form:{String(googleEnabled)}</div>
  ),
}));

import Page from "../app/(unauthenticated)/sign-in/[[...sign-in]]/page";

test("Sign In Page", async () => {
  isGoogleAuthEnabledMock.mockReturnValue(false);
  getSessionMock.mockResolvedValue(null);

  render(await Page({}));

  expect(screen.getByText("sign-in-form:false")).toBeDefined();
});
