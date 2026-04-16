const LEADING_SLASHES_PATTERN = /^\/+/u;
const TRAILING_SLASHES_PATTERN = /\/+$/u;

const trimLeadingSlashes = (value: string) =>
  value.replace(LEADING_SLASHES_PATTERN, "");

const trimTrailingSlashes = (value: string) =>
  value.replace(TRAILING_SLASHES_PATTERN, "");

const isRemoteUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const isInlineOnlyUrl = (value: string) =>
  value.startsWith("blob:") || value.startsWith("data:");

type NormalizeStorageObjectKeyOptions = {
  allowedPrefixes: string[];
  bucketName?: string;
  value: string;
};

type ExtractStorageObjectKeyOptions = NormalizeStorageObjectKeyOptions & {
  routePathnames?: string[];
};

const normalizeAllowedPrefixes = (allowedPrefixes: string[]) =>
  allowedPrefixes.map((prefix) => trimLeadingSlashes(prefix.trim()));

const normalizeBucketName = (bucketName?: string) => {
  if (!bucketName) {
    return "";
  }

  return trimTrailingSlashes(bucketName.trim());
};

const hasAllowedPrefix = (value: string, allowedPrefixes: string[]) =>
  normalizeAllowedPrefixes(allowedPrefixes).some((prefix) =>
    value.startsWith(prefix)
  );

const normalizeBucketPrefixedValue = (
  value: string,
  bucketName?: string
): string => {
  const normalizedBucketName = normalizeBucketName(bucketName);

  if (!normalizedBucketName) {
    return value;
  }

  const bucketPrefixes = [
    `${normalizedBucketName}/`,
    `gs://${normalizedBucketName}/`,
  ];

  for (const prefix of bucketPrefixes) {
    if (value.startsWith(prefix)) {
      return trimLeadingSlashes(value.slice(prefix.length));
    }
  }

  return value;
};

export const normalizeStorageObjectKey = ({
  allowedPrefixes,
  bucketName,
  value,
}: NormalizeStorageObjectKeyOptions): string => {
  const trimmedValue = value.trim();

  // Only persist canonical object keys here. Absolute paths, remote URLs, and
  // inline blobs belong to higher-level callers and should not be rewritten as
  // storage keys.
  if (
    !trimmedValue ||
    trimmedValue.startsWith("/") ||
    isInlineOnlyUrl(trimmedValue) ||
    isRemoteUrl(trimmedValue)
  ) {
    return "";
  }

  const normalizedValue = normalizeBucketPrefixedValue(
    trimmedValue,
    bucketName
  );

  if (!hasAllowedPrefix(normalizedValue, allowedPrefixes)) {
    return "";
  }

  return normalizedValue;
};

const extractStorageObjectKeyFromUrl = ({
  allowedPrefixes,
  bucketName,
  routePathnames = [],
  value,
}: ExtractStorageObjectKeyOptions): string => {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value, "http://localhost");
  } catch {
    return "";
  }

  const objectKeySearchParam = parsedUrl.searchParams.get("objectKey");

  if (objectKeySearchParam) {
    // Our own image proxy routes round-trip the canonical key via `objectKey`,
    // so prefer that over trying to infer a key from the pathname.
    return extractStorageObjectKey({
      allowedPrefixes,
      bucketName,
      routePathnames,
      value: objectKeySearchParam,
    });
  }

  if (routePathnames.includes(parsedUrl.pathname)) {
    return "";
  }

  const trimmedPathname = trimLeadingSlashes(
    decodeURIComponent(parsedUrl.pathname)
  );
  const directPathObjectKey = normalizeStorageObjectKey({
    allowedPrefixes,
    bucketName,
    value: trimmedPathname,
  });

  if (directPathObjectKey) {
    return directPathObjectKey;
  }

  const normalizedBucketName = normalizeBucketName(bucketName);

  if (!normalizedBucketName) {
    return "";
  }

  if (
    parsedUrl.hostname === "storage.googleapis.com" &&
    trimmedPathname.startsWith(`${normalizedBucketName}/`)
  ) {
    return normalizeStorageObjectKey({
      allowedPrefixes,
      bucketName,
      value: trimLeadingSlashes(
        trimmedPathname.slice(normalizedBucketName.length)
      ),
    });
  }

  if (parsedUrl.hostname === `${normalizedBucketName}.storage.googleapis.com`) {
    return normalizeStorageObjectKey({
      allowedPrefixes,
      bucketName,
      value: trimmedPathname,
    });
  }

  const storageApiPrefixes = [
    `download/storage/v1/b/${normalizedBucketName}/o/`,
    `storage/v1/b/${normalizedBucketName}/o/`,
    `v0/b/${normalizedBucketName}/o/`,
  ];

  // Accept the common Google Cloud Storage REST URL shapes so older persisted
  // references can be normalized back into a plain object key.
  for (const prefix of storageApiPrefixes) {
    if (trimmedPathname.startsWith(prefix)) {
      return normalizeStorageObjectKey({
        allowedPrefixes,
        bucketName,
        value: trimLeadingSlashes(trimmedPathname.slice(prefix.length)),
      });
    }
  }

  return "";
};

export const extractStorageObjectKey = (
  options: ExtractStorageObjectKeyOptions
): string => {
  const directObjectKey = normalizeStorageObjectKey(options);

  if (directObjectKey) {
    return directObjectKey;
  }

  return extractStorageObjectKeyFromUrl(options);
};

export const normalizeStoredMediaReference = ({
  bucketName,
  objectKeyExtractor,
  value,
}: {
  bucketName?: string;
  objectKeyExtractor: (value: string, bucketName?: string) => string;
  value: string | null | undefined;
}) => {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || isInlineOnlyUrl(trimmedValue)) {
    return "";
  }

  const objectKey = objectKeyExtractor(trimmedValue, bucketName);

  if (objectKey) {
    // When we can recover a canonical key, prefer storing that instead of a
    // signed URL or proxy URL so references remain stable across environments.
    return objectKey;
  }

  return trimmedValue;
};
