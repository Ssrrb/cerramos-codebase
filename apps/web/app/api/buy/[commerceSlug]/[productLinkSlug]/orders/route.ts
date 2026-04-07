import { NextResponse } from "next/server";
import {
  checkoutOrderPayloadSchema,
  createOrderFromProductLink,
  ProductLinkCheckoutError,
} from "@/lib/product-links";

interface CreateOrderRouteContext {
  params: Promise<{
    commerceSlug: string;
    productLinkSlug: string;
  }>;
}

export const POST = async (
  request: Request,
  context: CreateOrderRouteContext
) => {
  const body = (await request.json().catch(() => null)) as unknown;
  const result = checkoutOrderPayloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { commerceSlug, productLinkSlug } = await context.params;

  try {
    const order = await createOrderFromProductLink(
      commerceSlug,
      productLinkSlug,
      result.data
    );

    if (!order) {
      return NextResponse.json(
        { error: "Product link not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: order.orderId,
      paymentIntentId: order.paymentIntentId,
      paymentRequired: order.paymentRequired,
      success: true,
      upayFormId: order.upayFormId,
    });
  } catch (error) {
    if (error instanceof ProductLinkCheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "No se pudo crear el pedido." },
      { status: 500 }
    );
  }
};
