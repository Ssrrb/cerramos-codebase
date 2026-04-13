import {
  extractCommerceLogoObjectKey,
  normalizeStoredCommerceLogoReference,
} from "@repo/storage/commerce-logo";

export const normalizeCommerceLogoObjectKey = (
  value: string,
  bucketName?: string
) => extractCommerceLogoObjectKey(value, bucketName);

export const buildCommerceLogoImagePath = (objectKey: string) =>
  `/api/commerce/logo?objectKey=${encodeURIComponent(objectKey)}`;

export const resolveCommerceLogoImageSrc = (
  value: string | null | undefined,
  bucketName?: string
): string | null => {
  if (!value) {
    return null;
  }

  const normalizedReference = normalizeStoredCommerceLogoReference(
    value,
    bucketName
  );
  const objectKey = extractCommerceLogoObjectKey(
    normalizedReference,
    bucketName
  );

  if (!objectKey) {
    return normalizedReference || value;
  }

  return buildCommerceLogoImagePath(objectKey);
};
