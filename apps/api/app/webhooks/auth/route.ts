import { NextResponse } from "next/server";

export const POST = async (request: Request): Promise<Response> => {
  await request.text();

  return NextResponse.json(
    {
      message:
        "External auth webhooks are disabled. Cerramos uses Better Auth with first-party, DB-backed sessions.",
      ok: false,
    },
    { status: 410 }
  );
};
