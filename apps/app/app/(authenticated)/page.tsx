import { requireCommerceContext } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import AppAreaChart from "@/app/components/AppAreaChart";
import AppPieChart from "@/app/components/AppPieChart";
import AppBarChart from "@/app/components/app-bar-chart";
import type { AppBarChartRecord } from "@/app/components/app-bar-chart-data";
import CardList from "@/app/components/CardList";
import TodoList from "@/app/components/todo-list";

//TODO: Add a feature that fetches the top 5 clients from the database of the store and displays them in the list.
const Homepage = async () => {
  const context = await requireCommerceContext();
  const chartGeneratedAt = new Date().toISOString();
  const chartRecords = await database
    .select({
      category: schema.product.category,
      confirmedAt: schema.order.confirmedAt,
      createdAt: schema.order.createdAt,
      orderStatus: schema.order.orderStatus,
      productLinkId: schema.productLink.id,
      productTitle: schema.productLink.title,
    })
    .from(schema.order)
    .innerJoin(
      schema.productLink,
      eq(schema.productLink.id, schema.order.productLinkId)
    )
    .innerJoin(
      schema.product,
      eq(schema.product.id, schema.productLink.productId)
    )
    .where(eq(schema.order.commerceId, context.commerce.id))
    .orderBy(desc(schema.order.createdAt));

  const chartData = chartRecords.map<AppBarChartRecord>((record) => ({
    category: record.category,
    createdAt: record.createdAt.toISOString(),
    productLinkId: record.productLinkId,
    productTitle: record.productTitle,
    successful:
      record.orderStatus === "confirmed" || record.confirmedAt !== null,
  }));

  return (
    <div className="dashboard-grid grid grid-cols-1 pb-6 lg:grid-cols-2 2xl:grid-cols-4">
      <div className="dashboard-panel lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppBarChart generatedAt={chartGeneratedAt} records={chartData} />
      </div>
      <div className="dashboard-panel">
        <CardList title="Clientes" />
      </div>
      <div className="dashboard-panel">
        <AppPieChart />
      </div>
      <div className="dashboard-panel">
        <TodoList />
      </div>
      <div className="dashboard-panel lg:col-span-2 xl:col-span-1 2xl:col-span-2">
        <AppAreaChart />
      </div>
      <div className="dashboard-panel">
        <CardList title="Productos" />
      </div>
    </div>
  );
};

export default Homepage;
