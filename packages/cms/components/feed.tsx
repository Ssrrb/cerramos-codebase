import type { PumpProps, PumpQuery } from "basehub/react-pump";
import { isCMSConfigured } from "..";

export const Feed = async <
  Queries extends Array<PumpQuery>,
  Bind extends unknown | undefined = undefined,
>(
  props: PumpProps<Queries, Bind>
) => {
  if (!isCMSConfigured) {
    return null;
  }

  const { Pump } = await import("basehub/react-pump");

  return <Pump {...props} />;
};
