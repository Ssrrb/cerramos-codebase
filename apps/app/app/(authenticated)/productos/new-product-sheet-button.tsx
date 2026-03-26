"use client";

import { Plus } from "lucide-react";
import type React from "react";
import AddProduct from "../../components/add-product";
import { Button } from "../../components/ui/button";
import { Sheet, SheetTrigger } from "../../components/ui/sheet";

interface NewProductSheetButtonProps {
  children: string;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}

export const NewProductSheetButton = ({
  children,
  className,
  size = "default",
}: NewProductSheetButtonProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className={className} size={size}>
          <Plus />
          {children}
        </Button>
      </SheetTrigger>
      <AddProduct />
    </Sheet>
  );
};
