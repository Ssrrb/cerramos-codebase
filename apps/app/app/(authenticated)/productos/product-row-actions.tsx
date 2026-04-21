"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Sheet } from "@repo/design-system/components/ui/sheet";
import { LoaderCircle, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductSheetContent } from "@/app/components/product-sheet-content";
import type { ProductWithLinkTableRow } from "@/lib/product-links";
import { ProductLinkSheetContent } from "./product-link-sheet-content";

interface ProductRowActionsProps {
  product: ProductWithLinkTableRow;
}

export const ProductRowActions = ({ product }: ProductRowActionsProps) => {
  const router = useRouter();
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isProductLinkSheetOpen, setIsProductLinkSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!(deleteRequested && !isMenuOpen)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDeleteError(null);
      setIsDeleteDialogOpen(true);
      setDeleteRequested(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [deleteRequested, isMenuOpen]);

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
        success?: boolean;
      } | null;

      if (!response.ok) {
        setDeleteError(payload?.error ?? "No se pudo eliminar el producto.");
        return;
      }

      if (!(payload?.success && typeof payload.id === "string")) {
        setDeleteError("No se pudo eliminar el producto.");
        return;
      }

      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch {
      setDeleteError("No se pudo eliminar el producto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet onOpenChange={setIsEditSheetOpen} open={isEditSheetOpen}>
        <Sheet
          onOpenChange={setIsProductLinkSheetOpen}
          open={isProductLinkSheetOpen}
        >
          <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setIsMenuOpen(false);
                  setIsEditSheetOpen(true);
                }}
              >
                Editar producto
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setIsMenuOpen(false);
                  setIsProductLinkSheetOpen(true);
                }}
              >
                {product.productLink ? "Editar link publico" : "Publicar link"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  setIsMenuOpen(false);
                  setDeleteRequested(true);
                }}
              >
                Eliminar producto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ProductLinkSheetContent
            product={product}
            productLink={product.productLink}
          />
        </Sheet>
        <ProductSheetContent
          description="Actualiza la informacion visible y operativa de este producto."
          mode="edit"
          product={product}
          title="Editar producto"
        />
      </Sheet>
      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar {product.name} de tu catalogo. Esta accion no se
              puede deshacer.
            </AlertDialogDescription>
            {deleteError ? (
              <p className="text-destructive text-sm">{deleteError}</p>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Eliminando
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
