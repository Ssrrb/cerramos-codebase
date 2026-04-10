import {
  extractCommerceLogoObjectKey,
  normalizeStoredCommerceLogoReference,
} from "@repo/storage/commerce-logo";

export const getPublicCommerceLogoObjectKey = (
  value: string | null | undefined,
  bucketName?: string
): string => {
  if (!value) {
    return "";
  }

  return extractCommerceLogoObjectKey(value, bucketName);
};

export const buildPublicCommerceLogoPath = (objectKey: string) =>
  `/api/commerce-logos?objectKey=${encodeURIComponent(objectKey)}`;

export const normalizeCheckoutCommerceLogoUrl = (
  value: string | null | undefined
): string | null => {
  if (!value) {
    return null;
  }

  const normalizedReference = normalizeStoredCommerceLogoReference(
    value,
    process.env.GCS_BUCKET_NAME
  );
  const objectKey = getPublicCommerceLogoObjectKey(
    normalizedReference,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return normalizedReference || value;
  }

  return buildPublicCommerceLogoPath(objectKey);
};
