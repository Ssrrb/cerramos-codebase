import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProductsView } from "./products-view";

const emptyStateDescriptionPattern =
  /Agrega tu primer producto desde la barra lateral/i;

describe("ProductsView", () => {
  test("shows an empty state when there are no products", () => {
    render(<ProductsView products={[]} />);

    expect(screen.getByText("Todavia no tienes productos")).toBeDefined();
    expect(screen.getByText(emptyStateDescriptionPattern)).toBeDefined();
  });

  test("renders db-backed products in the table", () => {
    render(
      <ProductsView
        products={[
          {
            category: "T-shirts",
            colors: ["blue", "black"],
            description: "Descripcion extensa",
            id: "product_1",
            images: {
              black: "/productos/camiseta-negra.png",
              blue: "/productos/camiseta-azul.png",
            },
            name: "Camiseta Cerramos",
            shortDescription: "Camiseta premium",
            sizes: ["m", "l"],
            unitPrice: 149_000,
          },
        ]}
      />
    );

    expect(screen.getByText("Camiseta Cerramos")).toBeDefined();
    expect(screen.getByText("Camiseta premium")).toBeDefined();
    expect(screen.getByText("Gs. 149.000")).toBeDefined();
    expect(screen.getByAltText("Camiseta Cerramos").getAttribute("src")).toBe(
      "/productos/camiseta-azul.png"
    );
  });
});
