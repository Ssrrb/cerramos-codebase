import { getSession } from "@repo/auth/server";
import { slugifyCommerceName } from "@repo/auth/utils";
import { database, schema } from "@repo/database";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const findAvailableSlug = async (commerceName: string) => {
  const baseSlug = slugifyCommerceName(commerceName);
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const existingCommerce = await database
      .select({ id: schema.commerce.id })
      .from(schema.commerce)
      .where(eq(schema.commerce.slug, candidate))
      .limit(1);

    if (existingCommerce.length === 0) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

export const POST = async (request: Request) => {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existingUser] = await database
    .select({ commerceId: schema.user.commerceId })
    .from(schema.user)
    .where(eq(schema.user.id, session.user.id))
    .limit(1);

  if (existingUser?.commerceId) {
    const [existingCommerce] = await database
      .select({
        id: schema.commerce.id,
        slug: schema.commerce.slug,
      })
      .from(schema.commerce)
      .where(eq(schema.commerce.id, existingUser.commerceId))
      .limit(1);

    if (existingCommerce) {
      return NextResponse.json({
        commerceId: existingCommerce.id,
        slug: existingCommerce.slug,
      });
    }
  }

  const body = (await request.json().catch(() => null)) as {
    commerceName?: unknown;
  } | null;
  const commerceName =
    typeof body?.commerceName === "string" ? body.commerceName.trim() : "";

  if (commerceName.length < 2) {
    return NextResponse.json(
      { error: "Ingresa un nombre valido para tu comercio." },
      { status: 400 }
    );
  }

  // This is the current onboarding completion step. It will later expand into
  // a fuller business-verification and email-confirmation workflow.
  const slug = await findAvailableSlug(commerceName);
  const [commerce] = await database
    .insert(schema.commerce)
    .values({
      name: commerceName,
      slug,
    })
    .returning({
      id: schema.commerce.id,
      slug: schema.commerce.slug,
    });

  await database
    .update(schema.user)
    .set({
      commerceId: commerce.id,
      role: "merchant_admin",
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, session.user.id));

  return NextResponse.json({
    commerceId: commerce.id,
    slug: commerce.slug,
  });
};
