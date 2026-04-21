const getErrorProperty = (error: unknown, key: string) => {
  if (!error || typeof error !== "object" || !(key in error)) {
    return undefined;
  }

  const errorRecord = error as Record<string, unknown>;

  return errorRecord[key];
};

const getErrorString = (error: unknown, key: string) => {
  const value = getErrorProperty(error, key);

  return typeof value === "string" ? value : "";
};

export const isMissingRelationError = (
  error: unknown,
  relationName?: string
) => {
  const candidates = [error, getErrorProperty(error, "cause")];
  const hasUndefinedTableCode = candidates.some(
    (candidate) => getErrorString(candidate, "code") === "42P01"
  );

  if (!hasUndefinedTableCode) {
    return false;
  }

  if (!relationName) {
    return true;
  }

  const normalizedRelationName = relationName.toLowerCase();

  return candidates.some((candidate) =>
    [
      getErrorString(candidate, "message"),
      getErrorString(candidate, "query"),
      getErrorString(candidate, "table"),
    ].some((value) => value.toLowerCase().includes(normalizedRelationName))
  );
};

export const isUniqueConstraintError = (
  error: unknown,
  constraintName?: string
) => {
  const candidates = [error, getErrorProperty(error, "cause")];
  const hasUniqueViolationCode = candidates.some(
    (candidate) => getErrorString(candidate, "code") === "23505"
  );

  if (!hasUniqueViolationCode) {
    return false;
  }

  if (!constraintName) {
    return true;
  }

  const normalizedConstraintName = constraintName.toLowerCase();

  return candidates.some((candidate) =>
    [
      getErrorString(candidate, "constraint"),
      getErrorString(candidate, "message"),
      getErrorString(candidate, "detail"),
    ].some((value) => value.toLowerCase().includes(normalizedConstraintName))
  );
};

export const isForeignKeyConstraintError = (error: unknown) => {
  const candidates = [error, getErrorProperty(error, "cause")];

  return candidates.some(
    (candidate) => getErrorString(candidate, "code") === "23503"
  );
};
