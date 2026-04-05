import { requireCommerceIdForRequest } from "@repo/auth/server";
import {
  database,
  isMissingRelationError,
  isUniqueConstraintError,
  schema,
} from "@repo/database";
import { and, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  buildPublicProductImagePath,
  parseProductLinkExpiresAt,
  productLinkPayloadSchema,
  productLinksMigrationRequiredMessage,
} from "@/lib/product-links";

interface ProductLinkRouteContext {
  params: Promise<{
    linkId: string;
  }>;
}

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

export const PATCH = async (
  request: Request,
  context: ProductLinkRouteContext
) => {
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

  const { linkId } = await context.params;

  try {
    const [currentLink] = await database
      .select({
        id: schema.productLink.id,
        productId: schema.productLink.productId,
        productImage: schema.product.image,
        productStatus: schema.product.status,
      })
      .from(schema.productLink)
      .innerJoin(
        schema.product,
        eq(schema.product.id, schema.productLink.productId)
      )
      .where(
        and(
          eq(schema.productLink.commerceId, commerceId),
          eq(schema.productLink.id, linkId)
        )
      );

    if (!currentLink) {
      return NextResponse.json(
        { error: "Product link not found." },
        { status: 404 }
      );
    }

    if (currentLink.productId !== result.data.productId) {
      return NextResponse.json(
        {
          error: "Product links cannot be moved to a different product.",
          fieldErrors: {
            productId: ["El producto del link no se puede cambiar."],
          },
        },
        { status: 400 }
      );
    }

    const expiresAt = parseProductLinkExpiresAt(result.data.expiresAt);
    const publishStateErrors = validatePublishState({
      expiresAt,
      productStatus: currentLink.productStatus,
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

    const [conflictingLink] = await database
      .select({
        id: schema.productLink.id,
      })
      .from(schema.productLink)
      .where(
        and(
          eq(schema.productLink.commerceId, commerceId),
          eq(schema.productLink.slug, result.data.slug),
          ne(schema.productLink.id, linkId)
        )
      );

    if (conflictingLink) {
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

    const [productLink] = await database
      .update(schema.productLink)
      .set({
        currency: "PYG",
        deliveryEnabled: result.data.deliveryEnabled,
        description: result.data.description || null,
        expiresAt,
        imageUrl: currentLink.productImage
          ? buildPublicProductImagePath(currentLink.productImage)
          : null,
        paymentRequired: result.data.paymentRequired,
        pickupEnabled: result.data.pickupEnabled,
        slug: result.data.slug,
        status: result.data.status,
        title: result.data.title,
        unitPrice: result.data.unitPrice,
      })
      .where(
        and(
          eq(schema.productLink.commerceId, commerceId),
          eq(schema.productLink.id, linkId)
        )
      )
      .returning({
        id: schema.productLink.id,
      });

    if (!productLink) {
      return NextResponse.json(
        { error: "Product link not found." },
        { status: 404 }
      );
    }

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
