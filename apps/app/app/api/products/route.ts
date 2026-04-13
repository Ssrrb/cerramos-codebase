import { randomUUID } from "node:crypto";
import { requireCommerceIdForRequest } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { NextResponse } from "next/server";
import {
  normalizeProductImageObjectKey,
  productPayloadSchema,
} from "@/lib/products";

export const POST = async (request: Request) => {
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

  const { imageObjectKey: _ignoredImageObjectKey, ...rest } = result.data;
  const productId = randomUUID();
  const productImageId = randomUUID();

  const product = await database.transaction(async (tx) => {
    const [createdProduct] = await tx
      .insert(schema.product)
      .values({
        commerceId,
        id: productId,
        primaryImageId: productImageId,
        ...rest,
      })
      .returning({
        id: schema.product.id,
      });

    await tx.insert(schema.productImage).values({
      id: productImageId,
      objectKey: imageObjectKey,
      position: 0,
      productId,
    });

    return createdProduct;
  });

  return NextResponse.json({
    id: product.id,
    success: true,
  });
};
