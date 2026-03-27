import type { ReactNode } from "react"
import {
  CreditCardIcon,
  ShieldAlertIcon,
  WalletMinimalIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty"
import { cn } from "@repo/design-system/lib/utils"
import type { CheckoutTrustState } from "./types"

interface CheckoutPaymentSectionProps {
  className?: string
  paymentRequired: boolean
  processorSlot?: ReactNode
  trustState: CheckoutTrustState
}

function CheckoutPaymentSection({
  className,
  paymentRequired,
  processorSlot,
  trustState,
}: CheckoutPaymentSectionProps) {
  const isVerified = trustState === "verified"

  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Pago</CardDescription>
        <CardTitle className="text-base">Finalizá el checkout</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!paymentRequired ? (
          <Empty className="rounded-[1.25rem] border-border/70 bg-muted/20 px-5 py-6">
            <EmptyHeader className="max-w-none items-start text-left">
              <EmptyMedia variant="icon">
                <WalletMinimalIcon />
              </EmptyMedia>
              <EmptyTitle className="w-full text-left text-base">
                Este pedido no requiere pago online
              </EmptyTitle>
              <EmptyDescription className="w-full text-left">
                El comercio va a coordinar el cobro después de confirmar el
                pedido.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : !isVerified ? (
          <Empty className="rounded-[1.25rem] border-border/70 bg-muted/20 px-5 py-6">
            <EmptyHeader className="max-w-none items-start text-left">
              <EmptyMedia variant="icon">
                <ShieldAlertIcon />
              </EmptyMedia>
              <EmptyTitle className="w-full text-left text-base">
                Pago online no disponible
              </EmptyTitle>
              <EmptyDescription className="w-full text-left">
                Este comercio todavía no habilitó el cobro embebido con Pagopar
                uPay.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : processorSlot ? (
          <div className="rounded-[1.25rem] border border-border/70 bg-muted/15 p-4">
            {processorSlot}
          </div>
        ) : (
          <Empty className="rounded-[1.25rem] border-border/70 bg-muted/20 px-5 py-6">
            <EmptyHeader className="max-w-none items-start text-left">
              <EmptyMedia variant="icon">
                <CreditCardIcon />
              </EmptyMedia>
              <EmptyTitle className="w-full text-left text-base">
                Procesador pendiente
              </EmptyTitle>
              <EmptyDescription className="w-full text-left">
                Este espacio queda listo para montar el componente certificado de
                Pagopar uPay.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/70 pt-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {paymentRequired && isVerified
            ? "Los datos sensibles del pago se capturan únicamente dentro del componente certificado del proveedor."
            : "El estado del pago y la confirmación comercial del pedido siguen siendo procesos separados."}
        </p>
      </CardFooter>
    </Card>
  )
}

export { CheckoutPaymentSection }
