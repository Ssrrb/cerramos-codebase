import { render, screen } from "@testing-library/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("./new-product-sheet-button", () => ({
  NewProductSheetButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("./columns", () => ({
  columns: [],
}));

vi.mock("./data-table", () => ({
  DataTable: ({
    data,
  }: {
    data: Array<{
      name: string;
      shortDescription: string;
      unitPrice: number;
      images: Record<string, string>;
    }>;
  }) => {
    const firstImage = Object.values(data[0]?.images ?? {})[0];

    return (
      <div>
        {data.map((product) => (
          <div key={product.name}>
            <span>{product.name}</span>
            <span>{product.shortDescription}</span>
            <span>{`Gs. ${product.unitPrice.toLocaleString("es-PY")}`}</span>
            {firstImage ? (
              <Image
                alt={product.name}
                height={80}
                src={firstImage}
                width={80}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  },
}));

import { ProductsView } from "./products-view";

const emptyStateDescriptionPattern = /Crea tu primer producto desde aqui/i;
const addProductButtonPattern = /Agregar producto/i;

describe("ProductsView", () => {
  test("shows an empty state when there are no products", () => {
    render(<ProductsView products={[]} />);

    expect(screen.getByText("Todavia no tienes productos")).toBeDefined();
    expect(screen.getByText(emptyStateDescriptionPattern)).toBeDefined();
    expect(
      screen.getByRole("button", { name: addProductButtonPattern })
    ).toBeDefined();
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
