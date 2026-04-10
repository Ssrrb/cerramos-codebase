const LEADING_SLASHES_PATTERN = /^\/+/u;
const TRAILING_SLASHES_PATTERN = /\/+$/u;

const PUBLIC_COMMERCE_LOGO_API_PATHNAMES = new Set(["/api/commerce-logos"]);

const trimLeadingSlashes = (value: string) =>
  value.replace(LEADING_SLASHES_PATTERN, "");

export const normalizePublicCommerceLogoObjectKey = (
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
          return normalizePublicCommerceLogoObjectKey(
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

const extractPublicCommerceLogoObjectKeyFromUrl = (
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
    return getPublicCommerceLogoObjectKey(objectKeySearchParam, bucketName);
  }

  if (PUBLIC_COMMERCE_LOGO_API_PATHNAMES.has(parsedUrl.pathname)) {
    return "";
  }

  const directPathObjectKey = normalizePublicCommerceLogoObjectKey(
    trimLeadingSlashes(decodeURIComponent(parsedUrl.pathname)),
    bucketName
  );

  if (directPathObjectKey) {
    return directPathObjectKey;
  }

  return "";
};

export const getPublicCommerceLogoObjectKey = (
  value: string | null | undefined,
  bucketName?: string
): string => {
  if (!value) {
    return "";
  }

  const directObjectKey = normalizePublicCommerceLogoObjectKey(
    value,
    bucketName
  );

  if (directObjectKey) {
    return directObjectKey;
  }

  return extractPublicCommerceLogoObjectKeyFromUrl(value, bucketName);
};

export const buildPublicCommerceLogoPath = (objectKey: string) =>
  `/api/commerce-logos?objectKey=${encodeURIComponent(objectKey)}`;

export const normalizeCheckoutCommerceLogoUrl = (
  value: string | null | undefined
): string | null => {
  if (!value) {
    return null;
  }

  const objectKey = getPublicCommerceLogoObjectKey(
    value,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return value;
  }

  return buildPublicCommerceLogoPath(objectKey);
};
