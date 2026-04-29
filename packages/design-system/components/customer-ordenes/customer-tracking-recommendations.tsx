import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Sparkles } from "lucide-react";
import type { CustomerTrackingRecommendation } from "./types";

export function CustomerTrackingRecommendations({
  description = "Atajos suaves para repetir compras útiles o retomar una suscripción sin salir de tu cuenta.",
  items,
  title = "Volver a pedir",
}: {
  description?: string;
  items: CustomerTrackingRecommendation[];
  title?: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-muted-foreground text-xs uppercase tracking-[0.14em]">
          <Sparkles className="size-3.5" />
          Recomendaciones
        </div>
        <div>
          <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
          <p className="mt-1 text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card
            className="rounded-[1.25rem] border-border/70 bg-background/95 py-0 shadow-xs"
            key={item.id}
          >
            <CardHeader className="space-y-3 px-4 pt-4 pb-0">
              <div className="flex flex-wrap items-center gap-2">
                {item.badgeLabel ? (
                  <Badge
                    className="rounded-full font-normal"
                    variant="secondary"
                  >
                    {item.badgeLabel}
                  </Badge>
                ) : null}
                {item.priceLabel ? (
                  <span className="font-medium text-sm">{item.priceLabel}</span>
                ) : null}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-muted-foreground text-sm leading-6">
                  {item.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <Button asChild className="w-full" variant="outline">
                <a href={item.action.href}>{item.action.label}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </aside>
  );
}
