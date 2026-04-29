import { requireCommerceContext } from "@repo/auth/server";
import { getMerchantOrders } from "@/lib/orders";
import { OrdersView } from "./orders-view";

const OrdersPage = async () => {
  const context = await requireCommerceContext();
  const orders = await getMerchantOrders(context.commerce.id);

  return <OrdersView orders={orders} />;
};

export default OrdersPage;
