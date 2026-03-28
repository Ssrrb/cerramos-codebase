"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  formatDeliveryIncludedLabel,
  formatProductStatusLabel,
  type ProductTableRow,
} from "@/lib/products";

export const columns: ColumnDef<ProductTableRow>[] = [
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
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
        {formatProductStatusLabel(row.original.status)}
      </Badge>
    ),
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
    cell: ({ row }) => formatDeliveryIncludedLabel(row.original.deliveryIncluded),
  },
  {
    accessorKey: "description",
    header: "Descripcion",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy product ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
