import { NextResponse } from "next/server";

export const POST = async (request: Request): Promise<Response> => {
  await request.text();

  return NextResponse.json(
    {
      message:
        "External auth webhooks are disabled. Cerramos uses first-party auth and DB-backed sessions.",
      ok: false,
    },
    { status: 410 }
  );
};
