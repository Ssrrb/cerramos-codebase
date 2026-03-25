import type { ProductTableRow } from "@/lib/products";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface ProductsViewProps {
  products: ProductTableRow[];
}

export const ProductsView = ({ products }: ProductsViewProps) => {
  return (
    <div>
      <div className="mb-8 rounded-md bg-secondary px-4 py-2">
        <h1 className="font-semibold">Todos los Productos</h1>
      </div>
      {products.length > 0 ? (
        <DataTable columns={columns} data={products} />
      ) : (
        <div className="rounded-md border border-dashed px-6 py-12 text-center">
          <h2 className="font-medium text-lg">Todavia no tienes productos</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Agrega tu primer producto desde la barra lateral para empezar a
            armar tu catalogo.
          </p>
        </div>
      )}
    </div>
  );
};
