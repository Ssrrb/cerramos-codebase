"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import {
  formatProductLinkStatusLabel,
  type ProductWithLinkTableRow,
} from "@/lib/product-links";
import {
  formatDeliveryIncludedLabel,
  formatProductStatusLabel,
  formatProductUnitPriceLabel,
} from "@/lib/products";
import { ProductRowActions } from "./product-row-actions";

export const columns: ColumnDef<ProductWithLinkTableRow>[] = [
  {
    accessorKey: "image",
    header: "Imagen",
    cell: ({ row }) => {
      const product = row.original;
      const imageSrc = product.image;

      if (!imageSrc) {
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-medium text-xs uppercase">
            {product.name.slice(0, 1)}
          </div>
        );
      }

      return (
        <div className="h-9 w-9 overflow-hidden rounded-full bg-secondary">
          <Image
            alt={product.name}
            className="h-full w-full object-cover"
            height={36}
            src={imageSrc}
            unoptimized
            width={36}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    id: "publicLink",
    header: "Link publico",
    cell: ({ row }) => {
      const productLink = row.original.productLink;

      if (!productLink) {
        return (
          <span className="text-muted-foreground text-sm">Sin publicar</span>
        );
      }

      return (
        <div className="space-y-1">
          <Badge
            variant={productLink.status === "active" ? "default" : "secondary"}
          >
            {formatProductLinkStatusLabel(productLink.status)}
          </Badge>
          <p className="max-w-[15rem] truncate text-muted-foreground text-xs">
            {productLink.publicPath}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {formatProductStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "unitPrice",
    header: "Precio",
    cell: ({ row }) =>
      `Gs. ${formatProductUnitPriceLabel(row.original.unitPrice)}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "category",
    header: "Categoria",
  },
  {
    accessorKey: "deliveryIncluded",
    header: "Delivery",
    cell: ({ row }) =>
      formatDeliveryIncludedLabel(row.original.deliveryIncluded),
  },
  {
    accessorKey: "description",
    header: "Descripcion",
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductRowActions product={row.original} />,
  },
];
