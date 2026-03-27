import type { ReactNode } from "react"

import { cn } from "@repo/design-system/lib/utils"
import { CheckoutHeader } from "./checkout-header"
import { CheckoutMerchantCard } from "./checkout-merchant-card"
import { CheckoutProductCard } from "./checkout-product-card"
import type {
  CheckoutMerchantSummary,
  CheckoutProductSummary,
} from "./types"

interface CheckoutMobileShellProps {
  className?: string
  deliverySlot: ReactNode
  merchant: CheckoutMerchantSummary
  paymentSlot: ReactNode
  product: CheckoutProductSummary
  secureLabel?: string
}

function CheckoutMobileShell({
  className,
  deliverySlot,
  merchant,
  paymentSlot,
  product,
  secureLabel,
}: CheckoutMobileShellProps) {
  return (
    <section
      className={cn("min-h-dvh bg-muted/25 px-4 py-4 sm:px-6 sm:py-6", className)}
    >
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <CheckoutHeader secureLabel={secureLabel} />
        <CheckoutMerchantCard merchant={merchant} />
        <CheckoutProductCard product={product} />
        {deliverySlot}
        {paymentSlot}
      </div>
    </section>
  )
}

export { CheckoutMobileShell }
