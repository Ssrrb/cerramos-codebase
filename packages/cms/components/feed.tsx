import type { ReactNode } from "react";
import { isCMSConfigured } from "..";

interface FeedProps {
  readonly children: (...args: any[]) => ReactNode | Promise<ReactNode>;
  readonly queries: readonly unknown[];
}

export const Feed = async (props: FeedProps) => {
  if (!isCMSConfigured) {
    return null;
  }

  const { Pump } = await import("basehub/react-pump");

  return <Pump {...(props as any)} />;
};
