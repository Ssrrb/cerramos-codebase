"use client";

import { Plus } from "lucide-react";
import type React from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { Sheet, SheetTrigger } from "@repo/design-system/components/ui/sheet";
import AddProduct from "../../components/add-product";

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
