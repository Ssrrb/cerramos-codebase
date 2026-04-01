import { render, screen } from "@testing-library/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
  }: {
    alt: string;
    src: string;
  }) => <img alt={alt} src={src} />,
}));

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
          category: string;
          deliveryIncluded: boolean;
          image: string;
          name: string;
          status: string;
          stock: number;
          unitPrice: number;
        }>;
      }) => {
    const firstImage = data[0]?.image;

    return (
      <div>
        {data.map((product) => (
          <div key={product.name}>
            <span>{product.name}</span>
            <span>{product.category}</span>
            <span>{product.status}</span>
            <span>{product.stock}</span>
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
            category: "Electrodomesticos",
            deliveryIncluded: true,
            description: "Descripcion extensa",
            id: "product_1",
            image: "/productos/licuadora.png",
            name: "Licuadora Cerramos",
            status: "active",
            stock: 14,
            unitPrice: 185000,
          },
        ]}
      />
    );

    expect(screen.getByText("Licuadora Cerramos")).toBeDefined();
    expect(screen.getByText("Electrodomesticos")).toBeDefined();
    expect(screen.getByText("active")).toBeDefined();
    expect(screen.getByAltText("Licuadora Cerramos").getAttribute("src")).toBe(
      "/productos/licuadora.png"
    );
  });
});
