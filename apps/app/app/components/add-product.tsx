"use client";

import { useRef } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { ScrollArea } from "@repo/design-system/components/ui/scroll-area";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { AddProductForm } from "@/app/(authenticated)/productos/add-product-form";

const AddProduct = () => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <SheetContent className="sm:max-w-3xl">
      <ScrollArea className="h-screen">
        <div className="space-y-5 px-1 pb-6">
          <SheetHeader className="space-y-2 pr-8">
            <SheetTitle>Nuevo producto</SheetTitle>
            <SheetDescription>
              Agrega un nuevo producto o servicio a tu catalogo.
            </SheetDescription>
          </SheetHeader>
          <AddProductForm onSuccess={() => closeButtonRef.current?.click()} />
          <SheetClose asChild>
            <Button className="sr-only" ref={closeButtonRef} type="button" variant="ghost">
              Cerrar
            </Button>
          </SheetClose>
        </div>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
