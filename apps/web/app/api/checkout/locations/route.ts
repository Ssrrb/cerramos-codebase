import { NextResponse } from "next/server";
import { getCheckoutLocationData } from "@/lib/checkout-locations";

export const GET = async () => {
  try {
    const locationData = await getCheckoutLocationData();

    return NextResponse.json(locationData);
  } catch {
    return NextResponse.json(
      {
        error: "No se pudieron cargar las ubicaciones de entrega.",
      },
      { status: 500 }
    );
  }
};
