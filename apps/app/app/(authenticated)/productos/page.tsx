import { requireCommerceContext } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import { ProductsView } from "./products-view";

const ProductsPage = async () => {
  const context = await requireCommerceContext();
  const products = await database
    .select({
      category: schema.product.category,
      deliveryIncluded: schema.product.deliveryIncluded,
      description: schema.product.description,
      id: schema.product.id,
      image: schema.product.image,
      name: schema.product.name,
      status: schema.product.status,
      stock: schema.product.stock,
    })
    .from(schema.product)
    .where(eq(schema.product.commerceId, context.commerce.id))
    .orderBy(desc(schema.product.createdAt));

  return <ProductsView products={products} />;
};

export default ProductsPage;
