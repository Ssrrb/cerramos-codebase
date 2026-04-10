import { requireCommerceContext } from "@repo/auth/server";
import { createSignedReadUrl } from "@repo/storage";
import {
  extractCommerceLogoObjectKey,
  normalizeCommerceLogoObjectKey,
} from "@repo/storage/commerce-logo";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const context = await requireCommerceContext();
  const { searchParams } = new URL(request.url);
  const rawObjectKey = searchParams.get("objectKey") ?? "";
  const objectKey = extractCommerceLogoObjectKey(
    rawObjectKey,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return NextResponse.json(
      { error: "Commerce logo object key is required." },
      { status: 400 }
    );
  }

  const currentCommerceLogoKey = normalizeCommerceLogoObjectKey(
    context.commerce.logoImageUrl ?? "",
    process.env.GCS_BUCKET_NAME
  );

  if (!currentCommerceLogoKey || objectKey !== currentCommerceLogoKey) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signedReadTarget = await createSignedReadUrl({ objectKey });
  const upstreamResponse = await fetch(signedReadTarget.url, {
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo cargar el logo del comercio." },
      { status: upstreamResponse.status }
    );
  }

  const headers = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");
  const cacheControl = upstreamResponse.headers.get("cache-control");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (cacheControl) {
    headers.set("cache-control", cacheControl);
  }

  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return new Response(upstreamResponse.body, {
    headers,
    status: 200,
  });
};
