import { eq } from "drizzle-orm";
import {
  database,
  schema,
} from "../client";
import {
  normalizeStoredCommerceLogoReference,
} from "../../storage/commerce-logo";
import {
  normalizeStoredProductImageReference,
} from "../../storage/product-image";

const bucketName = process.env.GCS_BUCKET_NAME;

if (!bucketName) {
  throw new Error("GCS_BUCKET_NAME is required to normalize image references.");
}

const normalizeValue = (
  value: string | null,
  normalizer: (value: string | null, bucketName?: string) => string
) => {
  const normalized = normalizer(value, bucketName);
  return normalized || null;
};

const [products, commerces, productLinks, orderItems] = await Promise.all([
  database
    .select({
      id: schema.product.id,
      image: schema.product.image,
    })
    .from(schema.product),
  database
    .select({
      id: schema.commerce.id,
      logoImageUrl: schema.commerce.logoImageUrl,
    })
    .from(schema.commerce),
  database
    .select({
      id: schema.productLink.id,
      imageUrl: schema.productLink.imageUrl,
    })
    .from(schema.productLink),
  database
    .select({
      id: schema.orderItem.id,
      imageUrl: schema.orderItem.imageUrl,
    })
    .from(schema.orderItem),
]);

let normalizedProducts = 0;
let normalizedCommerces = 0;
let normalizedProductLinks = 0;
let normalizedOrderItems = 0;

for (const product of products) {
  const normalizedImage = normalizeValue(
    product.image,
    normalizeStoredProductImageReference
  );

  if ((normalizedImage ?? "") === product.image) {
    continue;
  }

  await database
    .update(schema.product)
    .set({
      image: normalizedImage ?? "",
      updatedAt: new Date(),
    })
    .where(eq(schema.product.id, product.id));

  normalizedProducts += 1;
}

for (const commerce of commerces) {
  const normalizedLogoImageUrl = normalizeValue(
    commerce.logoImageUrl,
    normalizeStoredCommerceLogoReference
  );

  if (normalizedLogoImageUrl === commerce.logoImageUrl) {
    continue;
  }

  await database
    .update(schema.commerce)
    .set({
      logoImageUrl: normalizedLogoImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(schema.commerce.id, commerce.id));

  normalizedCommerces += 1;
}

for (const productLink of productLinks) {
  const normalizedImageUrl = normalizeValue(
    productLink.imageUrl,
    normalizeStoredProductImageReference
  );

  if (normalizedImageUrl === productLink.imageUrl) {
    continue;
  }

  await database
    .update(schema.productLink)
    .set({
      imageUrl: normalizedImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(schema.productLink.id, productLink.id));

  normalizedProductLinks += 1;
}

for (const orderItem of orderItems) {
  const normalizedImageUrl = normalizeValue(
    orderItem.imageUrl,
    normalizeStoredProductImageReference
  );

  if (normalizedImageUrl === orderItem.imageUrl) {
    continue;
  }

  await database
    .update(schema.orderItem)
    .set({
      imageUrl: normalizedImageUrl,
    })
    .where(eq(schema.orderItem.id, orderItem.id));

  normalizedOrderItems += 1;
}

console.log(
  [
    `Normalized products: ${normalizedProducts}`,
    `Normalized commerce logos: ${normalizedCommerces}`,
    `Normalized product link images: ${normalizedProductLinks}`,
    `Normalized order item images: ${normalizedOrderItems}`,
  ].join("\n")
);
