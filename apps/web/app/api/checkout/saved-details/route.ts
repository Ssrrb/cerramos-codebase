import { getCurrentCustomerProfile, getSession } from "@repo/auth/server";
import { NextResponse } from "next/server";
import { saveCheckoutDetails } from "@/lib/checkout-saved-details";
import { checkoutOrderPayloadSchema } from "@/lib/product-links";

export const POST = async (request: Request) => {
  const session = await getSession();

  if (!session?.user.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = checkoutOrderPayloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const customerProfile = await getCurrentCustomerProfile();
  const customerId = customerProfile?.id ?? session.user.customerId ?? null;

  if (!customerId) {
    return NextResponse.json(
      { error: "Customer profile not found." },
      { status: 401 }
    );
  }

  const savedDetails = await saveCheckoutDetails({
    customerId,
    payload: result.data,
  });

  return NextResponse.json({
    success: true,
    ...savedDetails,
  });
};
