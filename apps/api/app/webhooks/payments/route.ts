import { analytics } from "@repo/analytics/server";
import { parseError } from "@repo/observability/error";
import { log } from "@repo/observability/log";
import { pagopar, parseWebhook, verifyWebhook } from "@repo/payments";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (request: Request): Promise<Response> => {
  if (!pagopar) {
    return NextResponse.json({ message: "Not configured", ok: false });
  }

  try {
    const body = await request.text();
    const headerPayload = await headers();
    const isVerified = await verifyWebhook(body, headerPayload);

    if (!isVerified) {
      return NextResponse.json(
        { message: "Invalid webhook signature", ok: false },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body) as unknown;
    const event = await parseWebhook(payload, headerPayload);

    log.info("PagoPar webhook received", {
      eventType: event.eventType,
      externalEventId: event.externalEventId,
      status: event.status,
    });

    analytics?.capture({
      event: `Payment ${event.status}`,
      distinctId: event.externalReference ?? "unknown-payment",
    });

    await analytics?.shutdown();

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    const message = parseError(error);

    log.error(message);

    return NextResponse.json(
      {
        message: "something went wrong",
        ok: false,
      },
      { status: 500 }
    );
  }
};
