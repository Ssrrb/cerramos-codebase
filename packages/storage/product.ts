import "server-only";

import { buildObjectKey } from "./index";

export type BuildProductImageKeyOptions = {
  commerceId: string;
  fileName: string;
};

export const buildProductImageKey = ({
  commerceId,
  fileName,
}: BuildProductImageKeyOptions) =>
  buildObjectKey({
    directory: "images",
    fileName,
    prefix: `products/${commerceId}`,
  });
