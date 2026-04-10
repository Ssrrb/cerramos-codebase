import { createSignedReadUrl } from "@repo/storage";
import { NextResponse } from "next/server";
import { getPublicCommerceLogoObjectKey } from "@/lib/commerce";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const objectKey = getPublicCommerceLogoObjectKey(
    searchParams.get("objectKey"),
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return NextResponse.json(
      { error: "Commerce logo object key is required." },
      { status: 400 }
    );
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
