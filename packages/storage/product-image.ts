import {
  extractStorageObjectKey,
  normalizeStorageObjectKey,
  normalizeStoredMediaReference,
} from "./object-key";

const PRODUCT_IMAGE_ROUTE_PATHNAMES = [
  "/api/product-link-images",
  "/api/products/image",
];

export const normalizeProductImageObjectKey = (
  value: string,
  bucketName?: string
) =>
  normalizeStorageObjectKey({
    allowedPrefixes: ["products/"],
    bucketName,
    value,
  });

export const extractProductImageObjectKey = (
  value: string,
  bucketName?: string
) =>
  extractStorageObjectKey({
    allowedPrefixes: ["products/"],
    bucketName,
    routePathnames: PRODUCT_IMAGE_ROUTE_PATHNAMES,
    value,
  });

export const normalizeStoredProductImageReference = (
  value: string | null | undefined,
  bucketName?: string
) =>
  normalizeStoredMediaReference({
    bucketName,
    objectKeyExtractor: extractProductImageObjectKey,
    value,
  });
