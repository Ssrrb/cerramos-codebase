import type { ProductTableRow } from "@/lib/products";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { NewProductSheetButton } from "./new-product-sheet-button";

interface ProductsViewProps {
  products: ProductTableRow[];
}
//TODO: Add a functionality to delete and edit products

export const ProductsView = ({ products }: ProductsViewProps) => {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/70 bg-muted/40 px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-balance font-semibold text-2xl text-foreground">
              Todos los productos
            </h1>
          </div>
          <NewProductSheetButton className="w-full sm:w-auto">
            Nuevo producto
          </NewProductSheetButton>
        </div>
      </section>
      {products.length > 0 ? (
        <DataTable columns={columns} data={products} />
      ) : (
        <div className="rounded-2xl border border-border/80 border-dashed bg-background px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <div className="space-y-2">
              <h2 className="font-medium text-2xl text-foreground">
                Todavia no tienes productos
              </h2>
              <p className="text-muted-foreground text-sm">
                Crea tu primer producto desde aqui para empezar a organizar tu
                catalogo.
              </p>
            </div>
            <NewProductSheetButton size="lg">
              Agregar producto
            </NewProductSheetButton>
          </div>
        </div>
      )}
    </div>
  );
};
