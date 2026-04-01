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
import { AddProductForm } from "@/app/(authenticated)/productos/add-product-form";
import type { ProductTableRow } from "@/lib/products";

interface ProductSheetContentProps {
  description: string;
  mode: "create" | "edit";
  product?: ProductTableRow;
  title: string;
}

export const ProductSheetContent = ({
  description,
  mode,
  product,
  title,
}: ProductSheetContentProps) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <SheetContent className="sm:max-w-3xl">
      <ScrollArea className="h-screen">
        <div className="space-y-5 px-1 pb-6">
          <SheetHeader className="space-y-2 pr-8">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <AddProductForm
            mode={mode}
            onSuccess={() => closeButtonRef.current?.click()}
            product={product}
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
