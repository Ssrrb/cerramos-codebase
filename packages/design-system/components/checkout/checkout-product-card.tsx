import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card"
import { AspectRatio } from "@repo/design-system/components/ui/aspect-ratio"
import { cn } from "@repo/design-system/lib/utils"
import type { CheckoutProductSummary } from "./types"

interface CheckoutProductCardProps {
  className?: string
  product: CheckoutProductSummary
}

function CheckoutProductCard({
  className,
  product,
}: CheckoutProductCardProps) {
  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Resumen del pedido</CardDescription>
        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-24 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted/40">
            <AspectRatio ratio={1}>
              <img
                alt={product.name}
                className="size-full object-cover"
                src={product.imageUrl}
              />
            </AspectRatio>
          </div>
          <p className="line-clamp-5 text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-border/70 pt-6">
        <span className="text-muted-foreground text-sm">Total</span>
        <span className="font-semibold text-base text-foreground">
          {product.priceLabel}
        </span>
      </CardFooter>
    </Card>
  )
}

export { CheckoutProductCard }
