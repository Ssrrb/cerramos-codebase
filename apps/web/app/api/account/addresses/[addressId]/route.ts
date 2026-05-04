import { getCurrentCustomerProfile, getSession } from "@repo/auth/server";
import { and, database, eq, schema } from "@repo/database";
import { NextResponse } from "next/server";
import { z } from "zod";
import { toCustomerAddressSummary } from "@/lib/customer-addresses";

interface AddressRouteContext {
  params: Promise<{
    addressId: string;
  }>;
}

const addressPatchSchema = z
  .object({
    cityId: z.string().trim().min(1).optional(),
    countryId: z.string().trim().min(1).optional(),
    isDefault: z.boolean().optional(),
    label: z.string().trim().optional(),
    phone: z.string().trim().min(1).optional(),
    postalCode: z.string().trim().optional(),
    recipientName: z.string().trim().min(1).optional(),
    referenceNote: z.string().trim().optional(),
    stateId: z.string().trim().min(1).optional(),
    streetLine1: z.string().trim().min(1).optional(),
    streetLine2: z.string().trim().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "No address fields provided.",
  });

const resolveCustomerId = async () => {
  const session = await getSession();

  if (!session?.user.id) {
    return null;
  }

  const customerProfile = await getCurrentCustomerProfile();

  return customerProfile?.id ?? session.user.customerId ?? null;
};

const fetchOwnedAddress = async (addressId: string, customerId: string) => {
  const [address] = await database
    .select({ id: schema.customerAddress.id })
    .from(schema.customerAddress)
    .where(
      and(
        eq(schema.customerAddress.id, addressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    )
    .limit(1);

  return address ?? null;
};

const fetchAddressSummary = async (addressId: string, customerId: string) => {
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
    .where(
      and(
        eq(schema.customerAddress.id, addressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    )
    .limit(1);

  return address ? toCustomerAddressSummary(address) : null;
};

export const PATCH = async (
  request: Request,
  context: AddressRouteContext
) => {
  const customerId = await resolveCustomerId();

  if (!customerId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { addressId } = await context.params;
  const body = (await request.json().catch(() => null)) as unknown;
  const result = addressPatchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid address data.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const ownedAddress = await fetchOwnedAddress(addressId, customerId);

  if (!ownedAddress) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  const updateValues = {
    ...result.data,
    label:
      result.data.label === undefined ? undefined : result.data.label || null,
    postalCode:
      result.data.postalCode === undefined
        ? undefined
        : result.data.postalCode || null,
    referenceNote:
      result.data.referenceNote === undefined
        ? undefined
        : result.data.referenceNote || null,
    streetLine2:
      result.data.streetLine2 === undefined
        ? undefined
        : result.data.streetLine2 || null,
    updatedAt: new Date(),
  };

  await database.transaction(async (tx) => {
    if (result.data.isDefault) {
      await tx
        .update(schema.customerAddress)
        .set({
          isDefault: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerAddress.customerId, customerId));
    }

    await tx
      .update(schema.customerAddress)
      .set(updateValues)
      .where(
        and(
          eq(schema.customerAddress.id, addressId),
          eq(schema.customerAddress.customerId, customerId)
        )
      );
  });

  const address = await fetchAddressSummary(addressId, customerId);

  return NextResponse.json(address);
};

export const DELETE = async (
  _request: Request,
  context: AddressRouteContext
) => {
  const customerId = await resolveCustomerId();

  if (!customerId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { addressId } = await context.params;
  const ownedAddress = await fetchOwnedAddress(addressId, customerId);

  if (!ownedAddress) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  await database
    .delete(schema.customerAddress)
    .where(
      and(
        eq(schema.customerAddress.id, addressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );

  return NextResponse.json({ success: true });
};
