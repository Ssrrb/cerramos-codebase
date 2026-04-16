import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { CheckoutProductMedia } from "./checkout-product-media";
import type { CheckoutProductSummary } from "./types";

interface CheckoutProductCardProps {
  className?: string;
  product: CheckoutProductSummary;
}

function CheckoutProductCard({ className, product }: CheckoutProductCardProps) {
  return (
    <Card className={cn("gap-0 rounded-[1.75rem] border-border/70", className)}>
      <CardHeader className="gap-1.5">
        <CardDescription>Resumen del pedido</CardDescription>
        <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:items-start">
          <CheckoutProductMedia
            className="w-full md:w-28"
            imageUrl={product.imageUrl}
            name={product.name}
            ratio={4 / 3}
          />
          <p className="line-clamp-5 text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between border-border/70 border-t pt-6">
        <span className="text-muted-foreground text-sm">Total</span>
        <span className="font-semibold text-base text-foreground">
          {product.priceLabel}
        </span>
      </CardFooter>
    </Card>
  );
}

export { CheckoutProductCard };
