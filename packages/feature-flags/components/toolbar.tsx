import { isToolbarEnabled } from "../lib/toolbar";

export const Toolbar = async () => {
  if (!isToolbarEnabled()) {
    return null;
  }

  const { VercelToolbar } = await import("@vercel/toolbar/next");

  return <VercelToolbar />;
};
