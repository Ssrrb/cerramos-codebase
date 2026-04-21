import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CommerceOnboardingFormView } from "./commerce-onboarding-form";

const {
  onBusinessNameChangeMock,
  onLogoFileSelectMock,
  onLogoRemoveMock,
  onSubmitMock,
} = vi.hoisted(() => ({
  onBusinessNameChangeMock: vi.fn(),
  onLogoFileSelectMock: vi.fn(),
  onLogoRemoveMock: vi.fn(),
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
    onLogoFileSelectMock.mockReset();
    onLogoRemoveMock.mockReset();
    onSubmitMock.mockClear();
  });

  test("renders onboarding content and forwards field events", () => {
    render(
      <CommerceOnboardingFormView
        businessName=""
        email="owner@example.com"
        error="No se pudo configurar tu comercio."
        logoUploadError="No se pudo subir el logo."
        name="Sebastian"
        onBusinessNameChange={onBusinessNameChangeMock}
        onLogoFileSelect={onLogoFileSelectMock}
        onLogoRemove={onLogoRemoveMock}
        onSubmit={onSubmitMock}
      />
    );

    fireEvent.change(screen.getByLabelText("Nombre del comercio"), {
      target: { value: "Tienda Centro" },
    });
    fireEvent.change(screen.getByLabelText("Cargar logo"), {
      target: {
        files: [new File(["logo"], "logo.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar al panel" }));

    expect(
      screen.getByText(/sebastian, agrega el nombre de tu negocio/i)
    ).toBeDefined();
    expect(
      screen.getByText("No se pudo configurar tu comercio.")
    ).toBeDefined();
    expect(screen.getByText("No se pudo subir el logo.")).toBeDefined();
    expect(onBusinessNameChangeMock).toHaveBeenCalledWith("Tienda Centro");
    expect(onLogoFileSelectMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
