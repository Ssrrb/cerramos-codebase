"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { NonDistractingFooter } from "../layout/non-distracting-footer";
import { NonDistractingHeader } from "../layout/non-distracting-header";
import {
  CheckoutProgressiveFlow,
  type CheckoutProgressiveFlowProps,
} from "./checkout-progressive-flow";

interface CheckoutPageProps
  extends Omit<CheckoutProgressiveFlowProps, "className" | "showHeader"> {
  accountAction?: ReactNode;
  className?: string;
  footerContent?: ReactNode;
}

function CheckoutPage({
  accountAction,
  className,
  footerContent,
  ...checkoutProps
}: CheckoutPageProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_34%,var(--color-background)_66%)_0%,var(--color-background)_18rem)] text-foreground",
        className
      )}
    >
      <NonDistractingHeader accountAction={accountAction} />
      <main className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <CheckoutProgressiveFlow
          {...checkoutProps}
          className="min-h-0 bg-transparent px-0 py-0 sm:px-0 sm:py-0 lg:px-0 lg:py-0"
          showHeader={false}
        />
      </main>
      <NonDistractingFooter>
        {footerContent ? (
          <div className="max-w-md text-center text-muted-foreground text-sm">
            {footerContent}
          </div>
        ) : null}
      </NonDistractingFooter>
    </div>
  );
}

export { CheckoutPage };
