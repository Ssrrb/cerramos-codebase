import { requireCommerceContext } from "@repo/auth/server";
import { database, isMissingRelationError, schema } from "@repo/database";
import { desc, eq } from "drizzle-orm";
import {
  buildProductLinkPublicPath,
  type ProductLinkTableRow,
  type ProductWithLinkTableRow,
  productLinksMigrationRequiredMessage,
} from "@/lib/product-links";
import { normalizeProductImageObjectKey } from "@/lib/products";
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

  const objectKey = normalizeProductImageObjectKey(
    image,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return "";
  }

  return `/api/products/image?objectKey=${encodeURIComponent(objectKey)}`;
};

const ProductsPage = async () => {
  const context = await requireCommerceContext();
  const products = await database
    .select({
      category: schema.product.category,
      deliveryIncluded: schema.product.deliveryIncluded,
      description: schema.product.description,
      id: schema.product.id,
      image: schema.productImage.objectKey,
      imageObjectKey: schema.productImage.objectKey,
      name: schema.product.name,
      status: schema.product.status,
      stock: schema.product.stock,
      unitPrice: schema.product.unitPrice,
    })
    .from(schema.product)
    .innerJoin(
      schema.productImage,
      eq(schema.productImage.id, schema.product.primaryImageId)
    )
    .where(eq(schema.product.commerceId, context.commerce.id))
    .orderBy(desc(schema.product.createdAt));
  let productLinksNotice: string | null = null;
  let productLinks: Array<{
    deliveryEnabled: boolean;
    description: string | null;
    expiresAt: Date | null;
    id: string;
    imageUrl: string | null;
    paymentRequired: boolean;
    pickupEnabled: boolean;
    productId: string;
    slug: string;
    status: "active" | "draft" | "expired" | "inactive";
    title: string;
    unitPrice: number;
  }> = [];

  try {
    productLinks = await database
      .select({
        deliveryEnabled: schema.productLink.deliveryEnabled,
        description: schema.productLink.description,
        expiresAt: schema.productLink.expiresAt,
        id: schema.productLink.id,
        imageUrl: schema.productImage.objectKey,
        paymentRequired: schema.productLink.paymentRequired,
        pickupEnabled: schema.productLink.pickupEnabled,
        productId: schema.productLink.productId,
        slug: schema.productLink.slug,
        status: schema.productLink.status,
        title: schema.productLink.title,
        unitPrice: schema.productLink.unitPrice,
      })
      .from(schema.productLink)
      .innerJoin(
        schema.product,
        eq(schema.product.id, schema.productLink.productId)
      )
      .innerJoin(
        schema.productImage,
        eq(schema.productImage.id, schema.product.primaryImageId)
      )
      .where(eq(schema.productLink.commerceId, context.commerce.id))
      .orderBy(desc(schema.productLink.createdAt));
  } catch (error) {
    if (!isMissingRelationError(error, "ProductLink")) {
      throw error;
    }

    productLinksNotice = productLinksMigrationRequiredMessage;
  }

  const productLinksByProductId = new Map<string, ProductLinkTableRow>(
    await Promise.all(
      productLinks.map(
        async (productLink): Promise<[string, ProductLinkTableRow]> => [
          productLink.productId,
          {
            currency: "PYG",
            deliveryEnabled: productLink.deliveryEnabled,
            description: productLink.description,
            expiresAt: productLink.expiresAt?.toISOString() ?? null,
            id: productLink.id,
            imageUrl: await resolveProductImage(productLink.imageUrl ?? ""),
            paymentRequired: productLink.paymentRequired,
            pickupEnabled: productLink.pickupEnabled,
            publicPath: buildProductLinkPublicPath(
              context.commerce.slug,
              productLink.slug
            ),
            slug: productLink.slug,
            status: productLink.status,
            title: productLink.title,
            unitPrice: productLink.unitPrice,
          },
        ]
      )
    )
  );

  const productsWithSignedUrls: ProductWithLinkTableRow[] = await Promise.all(
    products.map(async (product) => ({
      commerceSlug: context.commerce.slug,
      ...product,
      image: await resolveProductImage(product.image),
      productLink: productLinksByProductId.get(product.id) ?? null,
    }))
  );

  return (
    <ProductsView
      productLinksNotice={productLinksNotice}
      products={productsWithSignedUrls}
    />
  );
};

export default ProductsPage;
