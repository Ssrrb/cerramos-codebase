import { requireCommerceIdForRequest } from "@repo/auth/server";
import { database, isForeignKeyConstraintError, schema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  normalizeProductImageObjectKey,
  productPayloadSchema,
} from "@/lib/products";

export const dynamic = "force-dynamic";

interface ProductRouteContext {
  params: Promise<{
    productId: string;
  }>;
}

export const PATCH = async (request: Request, context: ProductRouteContext) => {
  const commerceId = await requireCommerceIdForRequest();

  if (commerceId instanceof NextResponse) {
    return commerceId;
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = productPayloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid product data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const imageObjectKey = normalizeProductImageObjectKey(
    result.data.imageObjectKey,
    process.env.GCS_BUCKET_NAME
  );

  if (!imageObjectKey) {
    return NextResponse.json(
      {
        error: "Invalid product data.",
        fieldErrors: {
          imageObjectKey: ["La imagen del producto es obligatoria."],
        },
      },
      { status: 400 }
    );
  }

  const { productId } = await context.params;
  const { imageObjectKey: _ignoredImageObjectKey, ...rest } = result.data;

  const product = await database.transaction(async (tx) => {
    const [currentProduct] = await tx
      .select({
        id: schema.product.id,
        primaryImageId: schema.product.primaryImageId,
        primaryImageObjectKey: schema.productImage.objectKey,
      })
      .from(schema.product)
      .innerJoin(
        schema.productImage,
        eq(schema.productImage.id, schema.product.primaryImageId)
      )
      .where(
        and(
          eq(schema.product.commerceId, commerceId),
          eq(schema.product.id, productId)
        )
      );

    if (!currentProduct) {
      return null;
    }

    if (currentProduct.primaryImageObjectKey !== imageObjectKey) {
      await tx
        .update(schema.productImage)
        .set({
          objectKey: imageObjectKey,
        })
        .where(
          and(
            eq(schema.productImage.id, currentProduct.primaryImageId),
            eq(schema.productImage.productId, productId)
          )
        );
    }

    const [updatedProduct] = await tx
      .update(schema.product)
      .set({
        ...rest,
        primaryImageId: currentProduct.primaryImageId,
      })
      .where(
        and(
          eq(schema.product.commerceId, commerceId),
          eq(schema.product.id, productId)
        )
      )
      .returning({
        id: schema.product.id,
      });

    if (!updatedProduct) {
      return null;
    }

    return updatedProduct;
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    success: true,
  });
};

export const DELETE = async (
  _request: Request,
  context: ProductRouteContext
) => {
  const commerceId = await requireCommerceIdForRequest();

  if (commerceId instanceof NextResponse) {
    return commerceId;
  }

  const { productId } = await context.params;

  try {
    const product = await database.transaction(async (tx) => {
      await tx
        .delete(schema.productLink)
        .where(
          and(
            eq(schema.productLink.commerceId, commerceId),
            eq(schema.productLink.productId, productId)
          )
        );

      const [deletedProduct] = await tx
        .delete(schema.product)
        .where(
          and(
            eq(schema.product.commerceId, commerceId),
            eq(schema.product.id, productId)
          )
        )
        .returning({
          id: schema.product.id,
        });

      return deletedProduct ?? null;
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: product.id,
      success: true,
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar este producto mientras tenga links publicos asociados.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "No se pudo eliminar el producto." },
      { status: 500 }
    );
  }
};
