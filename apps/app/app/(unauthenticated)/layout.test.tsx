import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

vi.mock("./globals.css", () => ({}));

vi.mock("./components/auth-chrome", () => ({
  AuthChrome: () => <div data-testid="auth-chrome">chrome</div>,
}));

test("renders a centered unauthenticated auth shell", async () => {
  const { default: AuthLayout } = await import("./layout");

  render(AuthLayout({ children: <div data-testid="auth-child">content</div> }));

  const authRoute = screen.getByTestId("auth-chrome").closest(".auth-route");
  const main = screen.getByRole("main");

  expect(authRoute?.className).toContain("min-h-dvh");
  expect(authRoute?.className).toContain("antialiased");
  expect(main.className).toContain("max-w-[72rem]");
  expect(main.className).toContain("items-center");
  expect(main.className).toContain("justify-center");
  expect(screen.getByTestId("auth-child").parentElement?.className).toContain(
    "w-full"
  );
});
