const LEADING_SLASHES_PATTERN = /^\/+/u;
const TRAILING_SLASHES_PATTERN = /\/+$/u;

const APP_COMMERCE_LOGO_API_PATHNAMES = new Set(["/api/commerce/logo"]);

const trimLeadingSlashes = (value: string) =>
  value.replace(LEADING_SLASHES_PATTERN, "");

export const normalizeCommerceLogoObjectKey = (
  value: string,
  bucketName?: string
): string => {
  const trimmedValue = value.trim();

  if (
    !trimmedValue ||
    trimmedValue.startsWith("blob:") ||
    trimmedValue.startsWith("data:") ||
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return "";
  }

  if (bucketName) {
    const trimmedBucketName = bucketName
      .trim()
      .replace(TRAILING_SLASHES_PATTERN, "");

    if (trimmedBucketName) {
      const bucketPrefixes = [
        `${trimmedBucketName}/`,
        `gs://${trimmedBucketName}/`,
      ];

      for (const prefix of bucketPrefixes) {
        if (trimmedValue.startsWith(prefix)) {
          return normalizeCommerceLogoObjectKey(
            trimLeadingSlashes(trimmedValue.slice(prefix.length))
          );
        }
      }
    }
  }

  if (trimmedValue.startsWith("/")) {
    return "";
  }

  if (!trimmedValue.startsWith("commerces/")) {
    return "";
  }

  return trimmedValue;
};

const extractCommerceLogoObjectKeyFromUrl = (
  value: string,
  bucketName?: string
): string => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value, "http://localhost");
  } catch {
    return "";
  }

  const objectKeySearchParam = parsedUrl.searchParams.get("objectKey");

  if (objectKeySearchParam) {
    return extractCommerceLogoObjectKey(objectKeySearchParam, bucketName);
  }

  if (APP_COMMERCE_LOGO_API_PATHNAMES.has(parsedUrl.pathname)) {
    return "";
  }

  const directPathObjectKey = normalizeCommerceLogoObjectKey(
    trimLeadingSlashes(decodeURIComponent(parsedUrl.pathname)),
    bucketName
  );

  if (directPathObjectKey) {
    return directPathObjectKey;
  }

  return "";
};

export const extractCommerceLogoObjectKey = (
  value: string,
  bucketName?: string
): string => {
  const directObjectKey = normalizeCommerceLogoObjectKey(value, bucketName);

  if (directObjectKey) {
    return directObjectKey;
  }

  return extractCommerceLogoObjectKeyFromUrl(value, bucketName);
};

export const buildCommerceLogoImagePath = (objectKey: string) =>
  `/api/commerce/logo?objectKey=${encodeURIComponent(objectKey)}`;

export const resolveCommerceLogoImageSrc = (
  value: string | null | undefined,
  bucketName?: string
): string | null => {
  if (!value) {
    return null;
  }

  const objectKey = extractCommerceLogoObjectKey(value, bucketName);

  if (!objectKey) {
    return value;
  }

  return buildCommerceLogoImagePath(objectKey);
};
