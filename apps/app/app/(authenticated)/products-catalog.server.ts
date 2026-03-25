import { database, schema } from "@repo/database";
import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  buildCatalogMetrics,
  buildProductCatalog,
} from "./components/products-catalog.lib";

export const getProductsCatalogData = async (commerceId: string) => {
  const productLinks = await database
    .select({
      currency: schema.productLink.currency,
      deliveryEnabled: schema.productLink.deliveryEnabled,
      description: schema.productLink.description,
      expiresAt: schema.productLink.expiresAt,
      id: schema.productLink.id,
      imageUrl: schema.productLink.imageUrl,
      paymentRequired: schema.productLink.paymentRequired,
      pickupEnabled: schema.productLink.pickupEnabled,
      slug: schema.productLink.slug,
      status: schema.productLink.status,
      title: schema.productLink.title,
      unitPrice: schema.productLink.unitPrice,
      updatedAt: schema.productLink.updatedAt,
    })
    .from(schema.productLink)
    .where(eq(schema.productLink.commerceId, commerceId))
    .orderBy(desc(schema.productLink.updatedAt), asc(schema.productLink.title));

  const productIds = productLinks.map((product) => product.id);
  const variants =
    productIds.length === 0
      ? []
      : await database
          .select({
            additionalPrice: schema.productVariantOption.additionalPrice,
            isDefault: schema.productVariantOption.isDefault,
            name: schema.productVariantOption.name,
            productLinkId: schema.productVariantOption.productLinkId,
            value: schema.productVariantOption.value,
          })
          .from(schema.productVariantOption)
          .where(inArray(schema.productVariantOption.productLinkId, productIds))
          .orderBy(
            asc(schema.productVariantOption.name),
            asc(schema.productVariantOption.value)
          );

  const products = buildProductCatalog(productLinks, variants);

  return {
    metrics: buildCatalogMetrics(products),
    products,
  };
};
