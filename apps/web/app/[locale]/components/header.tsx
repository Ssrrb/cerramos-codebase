import { NonDistractingHeader } from "@repo/design-system/components/layout/non-distracting-header";
import Link from "next/link";

export const Header = () => {
  return (
    <NonDistractingHeader
      accountAction={<Link href="/sign-in">Sign in for faster checkout</Link>}
    />
  );
};
