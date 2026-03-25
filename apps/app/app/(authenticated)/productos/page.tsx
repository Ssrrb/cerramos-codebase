import { requireCommerceContext } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import { ProductsView } from "./products-view";

const ProductsPage = async () => {
  const context = await requireCommerceContext();
  const products = await database
    .select({
      category: schema.product.category,
      colors: schema.product.colors,
      description: schema.product.description,
      id: schema.product.id,
      images: schema.product.images,
      name: schema.product.name,
      shortDescription: schema.product.shortDescription,
      sizes: schema.product.sizes,
      unitPrice: schema.product.unitPrice,
    })
    .from(schema.product)
    .where(eq(schema.product.commerceId, context.commerce.id))
    .orderBy(desc(schema.product.createdAt));

  return <ProductsView products={products} />;
};

export default ProductsPage;
