import { createSignedReadUrl } from "@repo/storage";
import { extractProductImageObjectKey } from "@repo/storage/product-image";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const objectKey = extractProductImageObjectKey(
    searchParams.get("objectKey") ?? "",
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return NextResponse.json(
      { error: "Product image object key is required." },
      { status: 400 }
    );
  }

  const signedReadTarget = await createSignedReadUrl({ objectKey });
  const upstreamResponse = await fetch(signedReadTarget.url, {
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo cargar la imagen del producto." },
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
