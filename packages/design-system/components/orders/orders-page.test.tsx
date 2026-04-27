// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../apps/app/node_modules/@testing-library/react";
import { TooltipProvider } from "../ui/tooltip";
import { OrdersPage } from "./orders-page";
import type { MerchantOrder } from "./types";

afterEach(() => {
  cleanup();
});

const orders: MerchantOrder[] = [
  {
    id: "order_pending",
    reference: "ORD-1",
    orderStatus: "new",
    paymentStatus: "not_required",
    customerName: "Camila Ferreira",
    productTitle: "Set matero",
    fulfillmentLabel: "Entrega a domicilio",
    totalLabel: "Gs. 145.000",
    createdAtLabel: "Hoy, 14:35",
  },
  {
    id: "order_completed",
    reference: "ORD-2",
    orderStatus: "confirmed",
    paymentStatus: "paid",
    customerName: "Luis Arce",
    productTitle: "Caja de alfajores",
    fulfillmentLabel: "Retiro en tienda",
    totalLabel: "Gs. 88.000",
    createdAtLabel: "Hoy, 13:10",
  },
];

const renderOrdersPage = (
  props: Partial<ComponentProps<typeof OrdersPage>> = {}
) =>
  render(
    <TooltipProvider>
      <OrdersPage orders={orders} {...props} />
    </TooltipProvider>
  );

describe("OrdersPage", () => {
  test("shows actions only for pending operational orders", () => {
    renderOrdersPage();

    expect(
      screen.getAllByRole("button", { name: "Marcar completo" })
    ).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Cancelar" })).toHaveLength(2);
    expect(screen.getAllByText("Sin acciones pendientes")).toHaveLength(2);
  });

  test("calls onCompleteOrder with the selected order id", () => {
    const onCompleteOrder = vi.fn();

    renderOrdersPage({ onCompleteOrder });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Marcar completo" })[0]
    );

    expect(onCompleteOrder).toHaveBeenCalledWith("order_pending");
  });

  test("calls onCancelOrder with the selected order id", () => {
    const onCancelOrder = vi.fn();

    renderOrdersPage({ onCancelOrder });

    fireEvent.click(screen.getAllByRole("button", { name: "Cancelar" })[0]);

    expect(onCancelOrder).toHaveBeenCalledWith("order_pending");
  });
});
