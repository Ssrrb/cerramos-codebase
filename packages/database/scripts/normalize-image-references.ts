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

const [productImages, commerces, orderItems] = await Promise.all([
  database
    .select({
      id: schema.productImage.id,
      objectKey: schema.productImage.objectKey,
    })
    .from(schema.productImage),
  database
    .select({
      id: schema.commerce.id,
      logoImageUrl: schema.commerce.logoImageUrl,
    })
    .from(schema.commerce),
  database
    .select({
      id: schema.orderItem.id,
      imageObjectKey: schema.orderItem.imageObjectKey,
    })
    .from(schema.orderItem),
]);

let normalizedProductImages = 0;
let normalizedCommerces = 0;
let normalizedOrderItems = 0;

for (const productImage of productImages) {
  const normalizedImage = normalizeValue(
    productImage.objectKey,
    normalizeStoredProductImageReference
  );

  if ((normalizedImage ?? "") === productImage.objectKey) {
    continue;
  }

  await database
    .update(schema.productImage)
    .set({
      objectKey: normalizedImage ?? "",
      updatedAt: new Date(),
    })
    .where(eq(schema.productImage.id, productImage.id));

  normalizedProductImages += 1;
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

for (const orderItem of orderItems) {
  const normalizedImageUrl = normalizeValue(
    orderItem.imageObjectKey,
    normalizeStoredProductImageReference
  );

  if (normalizedImageUrl === orderItem.imageObjectKey) {
    continue;
  }

  await database
    .update(schema.orderItem)
    .set({
      imageObjectKey: normalizedImageUrl,
    })
    .where(eq(schema.orderItem.id, orderItem.id));

  normalizedOrderItems += 1;
}

console.log(
  [
    `Normalized product images: ${normalizedProductImages}`,
    `Normalized commerce logos: ${normalizedCommerces}`,
    `Normalized order item images: ${normalizedOrderItems}`,
  ].join("\n")
);
