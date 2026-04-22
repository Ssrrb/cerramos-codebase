import { requireCommerceIdForRequest } from "@repo/auth/server";
import {
  database,
  isMissingRelationError,
  isUniqueConstraintError,
  schema,
} from "@repo/database";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  parseProductLinkExpiresAt,
  productLinkPayloadSchema,
  productLinksMigrationRequiredMessage,
  singleProductLinkPerProductMessage,
} from "@/lib/product-links";

const resolveProductForCommerce = async (
  commerceId: string,
  productId: string
) => {
  const [product] = await database
    .select({
      id: schema.product.id,
      status: schema.product.status,
    })
    .from(schema.product)
    .where(
      and(
        eq(schema.product.commerceId, commerceId),
        eq(schema.product.id, productId)
      )
    );

  return product;
};

const validatePublishState = ({
  expiresAt,
  productStatus,
  status,
}: {
  expiresAt: Date | null;
  productStatus: "active" | "draft" | "inactive";
  status: "active" | "draft" | "inactive" | "expired";
}) => {
  const fieldErrors: Record<string, string[] | undefined> = {};

  if (expiresAt && expiresAt.getTime() <= Date.now()) {
    fieldErrors.expiresAt = [
      "La fecha de expiracion debe ser posterior al momento actual.",
    ];
  }

  if (status === "active" && productStatus !== "active") {
    fieldErrors.status = ["Solo puedes activar links de productos activos."];
  }

  return fieldErrors;
};

export const POST = async (request: Request) => {
  const commerceId = await requireCommerceIdForRequest();

  if (commerceId instanceof NextResponse) {
    return commerceId;
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = productLinkPayloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid product link data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const product = await resolveProductForCommerce(
    commerceId,
    result.data.productId
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const expiresAt = parseProductLinkExpiresAt(result.data.expiresAt);
  const publishStateErrors = validatePublishState({
    expiresAt,
    productStatus: product.status,
    status: result.data.status,
  });

  if (Object.keys(publishStateErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Invalid product link data.",
        fieldErrors: publishStateErrors,
      },
      { status: 400 }
    );
  }

  try {
    const [existingLink] = await database
      .select({
        id: schema.productLink.id,
      })
      .from(schema.productLink)
      .where(
        and(
          eq(schema.productLink.commerceId, commerceId),
          eq(schema.productLink.slug, result.data.slug)
        )
      );

    if (existingLink) {
      return NextResponse.json(
        {
          error: "Invalid product link data.",
          fieldErrors: {
            slug: ["Ya existe un link publico con ese slug."],
          },
        },
        { status: 409 }
      );
    }

    const [existingLinkForProduct] = await database
      .select({
        id: schema.productLink.id,
      })
      .from(schema.productLink)
      .where(eq(schema.productLink.productId, result.data.productId));

    if (existingLinkForProduct) {
      return NextResponse.json(
        {
          error: "Invalid product link data.",
          fieldErrors: {
            productId: [singleProductLinkPerProductMessage],
          },
        },
        { status: 409 }
      );
    }

    const [productLink] = await database
      .insert(schema.productLink)
      .values({
        billingMode: result.data.billingMode,
        commerceId,
        currency: "PYG",
        description: result.data.description || null,
        expiresAt,
        fulfillmentMode: result.data.fulfillmentMode,
        paymentRequired: result.data.paymentRequired,
        deliveryEnabled:
          result.data.fulfillmentMode === "delivery" ||
          result.data.fulfillmentMode === "delivery_or_pickup",
        pickupEnabled:
          result.data.fulfillmentMode === "pickup" ||
          result.data.fulfillmentMode === "delivery_or_pickup",
        productId: result.data.productId,
        slug: result.data.slug,
        status: result.data.status,
        subscriptionCadence:
          result.data.billingMode === "subscription"
            ? result.data.subscriptionCadence
            : null,
        title: result.data.title,
        unitPrice: result.data.unitPrice,
      })
      .returning({
        id: schema.productLink.id,
      });

    return NextResponse.json({
      id: productLink.id,
      success: true,
    });
  } catch (error) {
    if (isMissingRelationError(error, "ProductLink")) {
      return NextResponse.json(
        {
          error: productLinksMigrationRequiredMessage,
        },
        { status: 503 }
      );
    }

    if (isUniqueConstraintError(error, "ProductLink_productId_key")) {
      return NextResponse.json(
        {
          error: "Invalid product link data.",
          fieldErrors: {
            productId: [singleProductLinkPerProductMessage],
          },
        },
        { status: 409 }
      );
    }

    if (isUniqueConstraintError(error, "ProductLink_commerceId_slug_key")) {
      return NextResponse.json(
        {
          error: "Invalid product link data.",
          fieldErrors: {
            slug: ["Ya existe un link publico con ese slug."],
          },
        },
        { status: 409 }
      );
    }

    throw error;
  }
};
