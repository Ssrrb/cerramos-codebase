import { describe, expect, test } from "vitest";
import { defaultProductLinkFormValues } from "./product-links";

describe("defaultProductLinkFormValues", () => {
  test("defaults services without delivery to no fulfillment", () => {
    expect(
      defaultProductLinkFormValues({
        category: "Servicios",
        deliveryIncluded: false,
        description: "Servicio remoto",
        id: "product_service_no_delivery",
        image: "https://cdn.example.com/service.png",
        imageObjectKey: "products/service.png",
        kind: "service",
        name: "Asesoria",
        status: "draft",
        stock: 0,
        unitPrice: 150_000,
      }).fulfillmentMode
    ).toBe("none");
  });

  test("defaults services with delivery to delivery or pickup", () => {
    expect(
      defaultProductLinkFormValues({
        category: "Servicios",
        deliveryIncluded: true,
        description: "Servicio con visita",
        id: "product_service_delivery",
        image: "https://cdn.example.com/service.png",
        imageObjectKey: "products/service.png",
        kind: "service",
        name: "Instalacion",
        status: "draft",
        stock: 0,
        unitPrice: 250_000,
      }).fulfillmentMode
    ).toBe("delivery_or_pickup");
  });

  test("keeps physical products on delivery or pickup", () => {
    expect(
      defaultProductLinkFormValues({
        category: "Electrodomesticos",
        deliveryIncluded: false,
        description: "Producto fisico",
        id: "product_physical",
        image: "https://cdn.example.com/product.png",
        imageObjectKey: "products/product.png",
        kind: "product",
        name: "Licuadora",
        status: "draft",
        stock: 7,
        unitPrice: 185_000,
      }).fulfillmentMode
    ).toBe("delivery_or_pickup");
  });
});
