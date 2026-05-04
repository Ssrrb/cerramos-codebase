import { getCurrentCustomerProfile, getSession } from "@repo/auth/server";
import { database, eq, schema } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCustomerAddressesPageData,
  toCustomerAddressSummary,
} from "@/lib/customer-addresses";

const addressFormSchema = z.object({
  cityId: z.string().trim().min(1, "Indicá la ciudad de esta dirección."),
  countryId: z.string().trim().min(1),
  isDefault: z.boolean(),
  label: z.string().trim(),
  phone: z.string().trim().min(1, "Ingresá un teléfono de contacto."),
  postalCode: z.string().trim(),
  recipientName: z.string().trim().min(1, "Ingresá el nombre de contacto."),
  referenceNote: z.string().trim(),
  stateId: z
    .string()
    .trim()
    .min(1, "Indicá el departamento de esta dirección."),
  streetLine1: z.string().trim().min(1, "Ingresá la dirección principal."),
  streetLine2: z.string().trim(),
});

const resolveCustomerId = async () => {
  const session = await getSession();

  if (!session?.user.id) {
    return null;
  }

  const customerProfile = await getCurrentCustomerProfile();

  return customerProfile?.id ?? session.user.customerId ?? null;
};

const fetchAddressSummary = async (addressId: string) => {
  const [address] = await database
    .select({
      cityId: schema.customerAddress.cityId,
      cityName: schema.city.name,
      countryId: schema.customerAddress.countryId,
      id: schema.customerAddress.id,
      isDefault: schema.customerAddress.isDefault,
      label: schema.customerAddress.label,
      phone: schema.customerAddress.phone,
      postalCode: schema.customerAddress.postalCode,
      recipientName: schema.customerAddress.recipientName,
      referenceNote: schema.customerAddress.referenceNote,
      stateId: schema.customerAddress.stateId,
      stateName: schema.state.name,
      streetLine1: schema.customerAddress.streetLine1,
      streetLine2: schema.customerAddress.streetLine2,
    })
    .from(schema.customerAddress)
    .innerJoin(schema.city, eq(schema.customerAddress.cityId, schema.city.id))
    .innerJoin(
      schema.state,
      eq(schema.customerAddress.stateId, schema.state.id)
    )
    .where(eq(schema.customerAddress.id, addressId))
    .limit(1);

  return address ? toCustomerAddressSummary(address) : null;
};

export const GET = async () => {
  const customerId = await resolveCustomerId();

  if (!customerId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const addresses = await getCustomerAddressesPageData(customerId);

  return NextResponse.json(addresses);
};

export const POST = async (request: Request) => {
  const customerId = await resolveCustomerId();

  if (!customerId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const result = addressFormSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid address data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const createdAddress = await database.transaction(async (tx) => {
    if (result.data.isDefault) {
      await tx
        .update(schema.customerAddress)
        .set({
          isDefault: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerAddress.customerId, customerId));
    }

    const [created] = await tx
      .insert(schema.customerAddress)
      .values({
        cityId: result.data.cityId,
        countryId: result.data.countryId,
        customerId,
        isDefault: result.data.isDefault,
        label: result.data.label || null,
        phone: result.data.phone || null,
        postalCode: result.data.postalCode || null,
        recipientName: result.data.recipientName || null,
        referenceNote: result.data.referenceNote || null,
        stateId: result.data.stateId,
        streetLine1: result.data.streetLine1,
        streetLine2: result.data.streetLine2 || null,
      })
      .returning({ id: schema.customerAddress.id });

    if (!created) {
      throw new Error("Address creation failed.");
    }

    return created;
  });

  const address = await fetchAddressSummary(createdAddress.id);

  return NextResponse.json(address);
};
