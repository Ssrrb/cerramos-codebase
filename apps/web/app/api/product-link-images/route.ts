import { createSignedReadUrl } from "@repo/storage";
import { NextResponse } from "next/server";
import { getPublicProductImageObjectKey } from "@/lib/product-links";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const objectKey = getPublicProductImageObjectKey(
    `/api/product-link-images?objectKey=${searchParams.get("objectKey") ?? ""}`
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

  return new Response(upstreamResponse.body, {
    headers,
    status: 200,
  });
};
