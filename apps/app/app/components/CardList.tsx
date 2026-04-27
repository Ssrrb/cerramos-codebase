import { requireCommerceContext } from "@repo/auth/server";
import { database, schema, sql } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import { normalizeProductImageObjectKey } from "@/lib/products";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";

const latestTransactions = [
  {
    id: 1,
    title: "Pago de pedido",
    badge: "John Doe",
    image:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1400,
  },
  {
    id: 2,
    title: "Pago de pedido",
    badge: "Jane Smith",
    image:
      "https://images.pexels.com/photos/4969918/pexels-photo-4969918.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 2100,
  },
  {
    id: 3,
    title: "Pago de pedido",
    badge: "Michael Johnson",
    image:
      "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1300,
  },
  {
    id: 4,
    title: "Pago de pedido",
    badge: "Lily Adams",
    image:
      "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 2500,
  },
  {
    id: 5,
    title: "Pago de pedido",
    badge: "Sam Brown",
    image:
      "https://images.pexels.com/photos/1680175/pexels-photo-1680175.jpeg?auto=compress&cs=tinysrgb&w=800",
    count: 1400,
  },
];

const resolveProductImage = (imageObjectKey: string | null) => {
  if (!imageObjectKey) {
    return null;
  }

  if (
    imageObjectKey.startsWith("/") ||
    imageObjectKey.startsWith("http://") ||
    imageObjectKey.startsWith("https://") ||
    imageObjectKey.startsWith("data:")
  ) {
    return imageObjectKey;
  }

  const objectKey = normalizeProductImageObjectKey(
    imageObjectKey,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return null;
  }

  return `/api/products/image?objectKey=${encodeURIComponent(objectKey)}`;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-PY", {
    currency: "PYG",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);

const getPopularProducts = async () => {
  const context = await requireCommerceContext();
  const soldUnits = sql<number>`coalesce(sum(${schema.orderItem.quantity}), 0)`;
  const revenue = sql<number>`coalesce(sum(${schema.orderItem.totalPrice}), 0)`;

  const products = await database
    .select({
      id: schema.product.id,
      imageObjectKey: schema.productImage.objectKey,
      name: schema.product.name,
      revenue,
      soldUnits,
      stock: schema.product.stock,
      unitPrice: schema.product.unitPrice,
    })
    .from(schema.product)
    .leftJoin(
      schema.productImage,
      eq(schema.productImage.id, schema.product.primaryImageId)
    )
    .leftJoin(
      schema.orderItem,
      eq(schema.orderItem.productId, schema.product.id)
    )
    .where(eq(schema.product.commerceId, context.commerce.id))
    .groupBy(
      schema.product.id,
      schema.product.name,
      schema.product.stock,
      schema.product.unitPrice,
      schema.productImage.objectKey
    )
    .orderBy(desc(soldUnits), desc(revenue), desc(schema.product.stock))
    .limit(5);

  return products.map((product) => ({
    id: product.id,
    image: resolveProductImage(product.imageObjectKey) ?? "",
    name: product.name,
    revenue: Number(product.revenue),
    soldUnits: Number(product.soldUnits),
    stock: product.stock,
    unitPrice: product.unitPrice,
  }));
};

const CardList = async ({ title }: { title: string }) => {
  const popularProducts =
    title === "Productos" ? await getPopularProducts() : [];
  const productCards =
    popularProducts.length > 0 ? (
      popularProducts.map((item) => (
        <Card
          className="dashboard-item flex-row items-center justify-between gap-4 p-4 shadow-none"
          key={item.id}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-muted">
            {item.image ? (
              <Image
                alt={item.name}
                className="object-cover"
                fill
                src={item.image}
              />
            ) : null}
          </div>
          <CardContent className="flex-1 p-0">
            <CardTitle className="font-medium text-sm">{item.name}</CardTitle>
            <p className="mt-1 text-muted-foreground text-xs">
              {item.soldUnits} vendidos • Stock {item.stock}
            </p>
          </CardContent>
          <CardFooter className="p-0 text-right font-medium">
            <div>
              <p>{formatCurrency(item.unitPrice)}</p>
              <p className="text-muted-foreground text-xs">
                {formatCurrency(item.revenue)}
              </p>
            </div>
          </CardFooter>
        </Card>
      ))
    ) : (
      <Card className="dashboard-item p-4 shadow-none">
        <CardContent className="p-0 text-muted-foreground text-sm">
          Todavia no hay productos para mostrar.
        </CardContent>
      </Card>
    );

  return (
    <div>
      <h1 className="dashboard-panel-title">{title}</h1>
      <div className="flex flex-col gap-2">
        {title === "Productos"
          ? productCards
          : latestTransactions.map((item) => (
              <Card
                className="dashboard-item flex-row items-center justify-between gap-4 p-4 shadow-none"
                key={item.id}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-sm">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    src={item.image}
                  />
                </div>
                <CardContent className="flex-1 p-0">
                  <CardTitle className="font-medium text-sm">
                    {item.title}
                  </CardTitle>
                  <Badge className="mt-2" variant="secondary">
                    {item.badge}
                  </Badge>
                </CardContent>
                <CardFooter className="p-0 font-medium">
                  ${item.count / 1000}K
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default CardList;
