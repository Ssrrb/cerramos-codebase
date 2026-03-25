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

vi.mock("../app/(unauthenticated)/components/sign-up-form", () => ({
  SignUpForm: ({ googleEnabled }: { googleEnabled?: boolean }) => (
    <div>sign-up-form:{String(googleEnabled)}</div>
  ),
}));

import Page from "../app/(unauthenticated)/sign-up/[[...sign-up]]/page";

test("Sign Up Page", async () => {
  isGoogleAuthEnabledMock.mockReturnValue(true);
  getSessionMock.mockResolvedValue(null);

  render(await Page({}));

  expect(screen.getByText("sign-up-form:true")).toBeDefined();
});
