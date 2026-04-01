"use client";

import { ProductSheetContent } from "./product-sheet-content";

const AddProduct = () => {
  return (
    <ProductSheetContent
      description="Agrega un nuevo producto o servicio a tu catalogo."
      mode="create"
      title="Nuevo producto"
    />
  );
};

export default AddProduct;
