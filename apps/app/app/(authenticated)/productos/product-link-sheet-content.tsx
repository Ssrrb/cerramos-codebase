"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { useRef } from "react";
import type {
  ProductLinkTableRow,
  ProductWithLinkTableRow,
} from "@/lib/product-links";
import { ProductLinkForm } from "./product-link-form";

interface ProductLinkSheetContentProps {
  product: ProductWithLinkTableRow;
  productLink?: ProductLinkTableRow | null;
}

export const ProductLinkSheetContent = ({
  product,
  productLink,
}: ProductLinkSheetContentProps) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isEditing = Boolean(productLink);

  return (
    <SheetContent className="sm:max-w-3xl">
      <ScrollArea className="h-screen">
        <div className="space-y-5 px-1 pb-6">
          <SheetHeader className="space-y-2 pr-8">
            <SheetTitle>
              {isEditing ? "Editar link publico" : "Publicar link"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Ajusta el slug, precio y condiciones del checkout publico."
                : "Crea la URL publica de checkout para este producto."}
            </SheetDescription>
          </SheetHeader>
          <ProductLinkForm
            onSuccess={() => closeButtonRef.current?.click()}
            product={product}
            productLink={productLink}
          />
          <SheetClose asChild>
            <Button
              className="sr-only"
              ref={closeButtonRef}
              type="button"
              variant="ghost"
            >
              Cerrar
            </Button>
          </SheetClose>
        </div>
      </ScrollArea>
    </SheetContent>
  );
};
