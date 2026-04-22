"use client";

import {
  Card,
  CardContent,
} from "@repo/design-system/components/ui/card";

interface ProductLogisticsNoteCardProps {
  deliveryIncluded: boolean;
  kindLabel: string;
  isService: boolean;
}

function ProductLogisticsNoteCard({
  deliveryIncluded,
  kindLabel,
  isService,
}: ProductLogisticsNoteCardProps) {
  return (
    <Card className="rounded-2xl border-border/70 bg-muted/25 py-0 shadow-none">
      <CardContent className="px-5 py-5">
        <p className="font-medium text-foreground text-sm">
          {deliveryIncluded
            ? "La logística queda habilitada por defecto"
            : "La logística queda fuera del flujo inicial"}
        </p>
        <div className="mt-3 space-y-2 text-sm leading-relaxed">
          <p className="text-muted-foreground">
            Oferta de tipo {kindLabel.toLowerCase()}.
          </p>
          <p className="text-muted-foreground">
            {deliveryIncluded
              ? isService
                ? "El link público podrá arrancar mostrando opciones de logística si la oferta necesita coordinación."
                : "El precio base ya contempla coordinación de entrega y el checkout puede pedir esos datos desde el inicio."
              : isService
                ? "El servicio se publica sin logística inicial y el checkout no muestra datos de entrega por defecto."
                : "El precio base no incluye entrega, así que ese costo o coordinación queda fuera de esta ficha inicial."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export { ProductLogisticsNoteCard };
