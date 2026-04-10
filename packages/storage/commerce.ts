import "server-only";

import { buildObjectKey } from "./index";

export type BuildCommerceLogoKeyOptions = {
  fileName: string;
  ownerId: string;
};

export const buildCommerceLogoKey = ({
  fileName,
  ownerId,
}: BuildCommerceLogoKeyOptions) =>
  buildObjectKey({
    directory: "logos",
    fileName,
    prefix: `commerces/${ownerId}`,
  });
