import { getSession } from "@repo/auth/server";
import { database, schema } from "@repo/database";
import { NextResponse } from "next/server";
import { productPayloadSchema } from "@/lib/products";

export const POST = async (request: Request) => {
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

  const [product] = await database
    .insert(schema.product)
    .values({
      ...result.data,
      commerceId: session.user.commerceId,
    })
    .returning({
      id: schema.product.id,
    });

  return NextResponse.json({
    id: product.id,
    success: true,
  });
};
