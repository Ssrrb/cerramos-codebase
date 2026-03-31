import { requireCommerceContext } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { createSignedReadUrl } from "@repo/storage";
import { desc, eq } from "drizzle-orm";
import { ProductsView } from "./products-view";

const resolveProductImage = async (image: string) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return (
    await createSignedReadUrl({
      objectKey: image,
    })
  ).url;
};

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

  const productsWithSignedUrls = await Promise.all(
    products.map(async (product) => ({
      ...product,
      image: await resolveProductImage(product.image),
    }))
  );

  return <ProductsView products={productsWithSignedUrls} />;
};

export default ProductsPage;
