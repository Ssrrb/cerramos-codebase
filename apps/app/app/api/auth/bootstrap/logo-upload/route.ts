import { getSession } from "@repo/auth/server";
import { createSignedUploadUrl } from "@repo/storage";
import { buildCommerceLogoKey } from "@repo/storage/commerce";
import { NextResponse } from "next/server";
import { productImageUploadRequestSchema } from "@/lib/products";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const POST = async (request: Request) => {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = productImageUploadRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid upload payload.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(result.data.contentType)) {
    return NextResponse.json(
      {
        error: "Solo puedes subir archivos de imagen compatibles.",
      },
      { status: 400 }
    );
  }

  const objectKey = buildCommerceLogoKey({
    fileName: result.data.fileName,
    ownerId: session.user.id,
  });

  const uploadTarget = await createSignedUploadUrl({
    contentType: result.data.contentType,
    maxBytes: result.data.size,
    objectKey,
  });

  return NextResponse.json(uploadTarget);
};
