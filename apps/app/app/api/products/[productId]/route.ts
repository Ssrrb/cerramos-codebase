import { getSession } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  normalizeProductImageObjectKey,
  productPayloadSchema,
} from "@/lib/products";

interface ProductRouteContext {
  params: Promise<{
    productId: string;
  }>;
}

const getCommerceId = async () => {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.commerceId) {
    return NextResponse.json(
      { error: "Commerce context is required." },
      { status: 400 }
    );
  }

  return session.user.commerceId;
};

export const PATCH = async (request: Request, context: ProductRouteContext) => {
  const commerceId = await getCommerceId();

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
  const images = {
    primary: imageObjectKey,
  };

  const [product] = await database
    .update(schema.product)
    .set({
      ...rest,
      image: imageObjectKey,
      images,
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
  const commerceId = await getCommerceId();

  if (commerceId instanceof NextResponse) {
    return commerceId;
  }

  const { productId } = await context.params;

  try {
    const [product] = await database
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

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      success: true,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
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
