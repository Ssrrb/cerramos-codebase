import {
  extractStorageObjectKey,
  normalizeStorageObjectKey,
  normalizeStoredMediaReference,
} from "./object-key";

const COMMERCE_LOGO_ROUTE_PATHNAMES = [
  "/api/commerce/logo",
  "/api/commerce-logos",
];

export const normalizeCommerceLogoObjectKey = (
  value: string,
  bucketName?: string
) =>
  normalizeStorageObjectKey({
    allowedPrefixes: ["commerces/"],
    bucketName,
    value,
  });

export const extractCommerceLogoObjectKey = (
  value: string,
  bucketName?: string
) =>
  extractStorageObjectKey({
    allowedPrefixes: ["commerces/"],
    bucketName,
    routePathnames: COMMERCE_LOGO_ROUTE_PATHNAMES,
    value,
  });

export const normalizeStoredCommerceLogoReference = (
  value: string | null | undefined,
  bucketName?: string
) =>
  normalizeStoredMediaReference({
    bucketName,
    objectKeyExtractor: extractCommerceLogoObjectKey,
    value,
  });
