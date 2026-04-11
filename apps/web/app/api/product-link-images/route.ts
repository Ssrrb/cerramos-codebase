import { parseError } from "@repo/observability/error";
import { log } from "@repo/observability/log";
import { createSignedReadUrl, objectExists } from "@repo/storage";
import { extractProductImageObjectKey } from "@repo/storage/product-image";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const bucketName = process.env.GCS_BUCKET_NAME;
  const objectKey = extractProductImageObjectKey(
    searchParams.get("objectKey") ?? "",
    bucketName
  );

  if (!objectKey) {
    log.warn("Public product image request rejected", {
      bucketName,
      failureStage: "invalid_key",
      objectKey,
      routeName: "product-link-images",
    });

    return NextResponse.json(
      { error: "Product image object key is required." },
      { status: 400 }
    );
  }

  try {
    const exists = await objectExists({ objectKey });

    if (!exists) {
      log.warn("Public product image object was not found", {
        bucketName,
        failureStage: "not_found",
        objectKey,
        routeName: "product-link-images",
      });

      return NextResponse.json(
        { error: "No se pudo cargar la imagen del producto." },
        { status: 404 }
      );
    }

    let signedReadTarget: Awaited<ReturnType<typeof createSignedReadUrl>>;

    try {
      signedReadTarget = await createSignedReadUrl({ objectKey });
    } catch (error) {
      const message = parseError(error);

      log.error("Failed to sign public product image read URL", {
        bucketName,
        errorMessage: message,
        failureStage: "sign_failed",
        objectKey,
        routeName: "product-link-images",
      });

      return NextResponse.json(
        { error: "No se pudo cargar la imagen del producto." },
        { status: 500 }
      );
    }

    let upstreamResponse: Response;

    try {
      upstreamResponse = await fetch(signedReadTarget.url, {
        cache: "no-store",
      });
    } catch (error) {
      const message = parseError(error);

      log.error("Failed to fetch public product image from storage", {
        bucketName,
        errorMessage: message,
        failureStage: "upstream_fetch_failed",
        objectKey,
        routeName: "product-link-images",
      });

      return NextResponse.json(
        { error: "No se pudo cargar la imagen del producto." },
        { status: 500 }
      );
    }

    if (!upstreamResponse.ok) {
      log.error("Storage responded with a non-OK status for product image", {
        bucketName,
        failureStage: "upstream_fetch_failed",
        objectKey,
        routeName: "product-link-images",
        upstreamStatus: upstreamResponse.status,
      });

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
  } catch (error) {
    const message = parseError(error);

    log.error("Unexpected public product image proxy failure", {
      bucketName,
      errorMessage: message,
      failureStage: "upstream_fetch_failed",
      objectKey,
      routeName: "product-link-images",
    });

    return NextResponse.json(
      { error: "No se pudo cargar la imagen del producto." },
      { status: 500 }
    );
  }
};
