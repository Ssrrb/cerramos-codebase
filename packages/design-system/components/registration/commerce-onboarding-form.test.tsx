import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CommerceOnboardingFormView } from "./commerce-onboarding-form";

const { onBusinessNameChangeMock, onSubmitMock } = vi.hoisted(() => ({
  onBusinessNameChangeMock: vi.fn(),
  onSubmitMock: vi.fn((event?: { preventDefault?: () => void }) =>
    event?.preventDefault?.()
  ),
}));

describe("commerce onboarding form view", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    onBusinessNameChangeMock.mockReset();
    onSubmitMock.mockClear();
  });

  test("renders onboarding content and forwards field events", () => {
    render(
      <CommerceOnboardingFormView
        businessName=""
        email="owner@example.com"
        error="No se pudo configurar tu comercio."
        name="Sebastian"
        onBusinessNameChange={onBusinessNameChangeMock}
        onSubmit={onSubmitMock}
      />
    );

    fireEvent.change(screen.getByLabelText("Nombre del comercio"), {
      target: { value: "Tienda Centro" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar al panel" }));

    expect(screen.getByText(/sebastian, necesitamos el nombre/i)).toBeDefined();
    expect(screen.getByText("No se pudo configurar tu comercio.")).toBeDefined();
    expect(onBusinessNameChangeMock).toHaveBeenCalledWith("Tienda Centro");
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
