import "server-only";

import { existsSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { Storage } from "@google-cloud/storage";
import { keys } from "./keys";

export type StorageClient = Storage;

export type BuildObjectKeyOptions = {
  directory?: string;
  fileName: string;
  prefix?: string;
};

export type CreateSignedUploadUrlOptions = {
  bucketName?: string;
  contentType: string;
  expiresInSeconds?: number;
  maxBytes?: number;
  objectKey: string;
};

export type CreateSignedReadUrlOptions = {
  bucketName?: string;
  expiresInSeconds?: number;
  objectKey: string;
};

export type DeleteObjectOptions = {
  bucketName?: string;
  ignoreNotFound?: boolean;
  objectKey: string;
};

export type ObjectExistsOptions = {
  bucketName?: string;
  objectKey: string;
};

export type SignedUploadTarget = {
  bucketName: string;
  contentType: string;
  expiresAt: string;
  headers: Record<string, string>;
  maxBytes?: number;
  method: "PUT";
  objectKey: string;
  url: string;
};

export type SignedReadTarget = {
  bucketName: string;
  expiresAt: string;
  objectKey: string;
  url: string;
};

const DEFAULT_DIRECTORY = "uploads";
const DEFAULT_UPLOAD_URL_TTL_SECONDS = 15 * 60;
const DEFAULT_READ_URL_TTL_SECONDS = 15 * 60;

let cachedStorageClient: Storage | undefined;

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const sanitizePathSegment = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const getBucketName = (bucketName?: string) =>
  bucketName ?? keys().GCS_BUCKET_NAME;

const toExpiryDate = (seconds: number) => new Date(Date.now() + seconds * 1000);

const getUploadTtlSeconds = (seconds?: number) =>
  seconds ??
  keys().GCS_UPLOAD_URL_TTL_SECONDS ??
  DEFAULT_UPLOAD_URL_TTL_SECONDS;

const getReadTtlSeconds = (seconds?: number) =>
  seconds ?? keys().GCS_READ_URL_TTL_SECONDS ?? DEFAULT_READ_URL_TTL_SECONDS;

const resolveCredentialPath = (credentialPath?: string) => {
  if (!credentialPath) {
    return undefined;
  }

  if (!isAbsolute(credentialPath) || existsSync(credentialPath)) {
    return credentialPath;
  }

  const fileName = basename(credentialPath);
  let currentDirectory = process.cwd();

  while (true) {
    const candidatePath = join(currentDirectory, fileName);

    if (existsSync(candidatePath)) {
      return candidatePath;
    }

    const parentDirectory = dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      return credentialPath;
    }

    currentDirectory = parentDirectory;
  }
};

export const createStorageClient = (): Storage => {
  if (cachedStorageClient) {
    return cachedStorageClient;
  }

  const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CLOUD_PROJECT } = keys();

  cachedStorageClient = new Storage({
    keyFilename: resolveCredentialPath(GOOGLE_APPLICATION_CREDENTIALS),
    projectId: GOOGLE_CLOUD_PROJECT || undefined,
  });

  return cachedStorageClient;
};

export const buildObjectKey = ({
  directory = DEFAULT_DIRECTORY,
  fileName,
  prefix,
}: BuildObjectKeyOptions) => {
  const name = sanitizePathSegment(fileName);

  if (!name) {
    throw new Error("A valid file name is required to build an object key.");
  }

  const parts = [
    prefix ? trimSlashes(prefix) : undefined,
    trimSlashes(directory),
    `${crypto.randomUUID()}-${name}`,
  ].filter(Boolean);

  return parts.join("/");
};

export const createSignedUploadUrl = async ({
  bucketName,
  contentType,
  expiresInSeconds,
  maxBytes,
  objectKey,
}: CreateSignedUploadUrlOptions): Promise<SignedUploadTarget> => {
  const resolvedBucketName = getBucketName(bucketName);
  const expiresAt = toExpiryDate(getUploadTtlSeconds(expiresInSeconds));
  const storage = createStorageClient();
  const [url] = await storage
    .bucket(resolvedBucketName)
    .file(objectKey)
    .getSignedUrl({
      action: "write",
      contentType,
      expires: expiresAt,
      version: "v4",
    });

  return {
    bucketName: resolvedBucketName,
    contentType,
    expiresAt: expiresAt.toISOString(),
    headers: {
      "content-type": contentType,
    },
    maxBytes,
    method: "PUT",
    objectKey,
    url,
  };
};

export const createSignedReadUrl = async ({
  bucketName,
  expiresInSeconds,
  objectKey,
}: CreateSignedReadUrlOptions): Promise<SignedReadTarget> => {
  const resolvedBucketName = getBucketName(bucketName);
  const expiresAt = toExpiryDate(getReadTtlSeconds(expiresInSeconds));
  const storage = createStorageClient();
  const [url] = await storage
    .bucket(resolvedBucketName)
    .file(objectKey)
    .getSignedUrl({
      action: "read",
      expires: expiresAt,
      version: "v4",
    });

  return {
    bucketName: resolvedBucketName,
    expiresAt: expiresAt.toISOString(),
    objectKey,
    url,
  };
};

export const objectExists = async ({
  bucketName,
  objectKey,
}: ObjectExistsOptions): Promise<boolean> => {
  const storage = createStorageClient();
  const [exists] = await storage
    .bucket(getBucketName(bucketName))
    .file(objectKey)
    .exists();

  return exists;
};

export const deleteObject = async ({
  bucketName,
  ignoreNotFound = true,
  objectKey,
}: DeleteObjectOptions) => {
  const storage = createStorageClient();
  await storage.bucket(getBucketName(bucketName)).file(objectKey).delete({
    ignoreNotFound,
  });
};
