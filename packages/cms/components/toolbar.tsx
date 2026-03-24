import { isCMSConfigured } from "..";

export const Toolbar = async () => {
  if (!isCMSConfigured) {
    return null;
  }

  const { Toolbar: BaseHubToolbar } = await import("basehub/next-toolbar");

  return <BaseHubToolbar />;
};
