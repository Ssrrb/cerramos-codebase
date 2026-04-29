import { and, database, eq, schema } from "@repo/database";
import type { CheckoutOrderPayload } from "@/lib/product-links";

type SaveCheckoutDetailsPayload = Extract<
  CheckoutOrderPayload,
  { countryId: string }
>;

export interface SaveCheckoutDetailsInput {
  customerId: string;
  payload: CheckoutOrderPayload;
}

const isNormalizedCheckoutPayload = (
  payload: CheckoutOrderPayload
): payload is SaveCheckoutDetailsPayload => "countryId" in payload;

const applyDefaultAddressSelection = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  customerId: string,
  customerAddressId: string
) => {
  await tx
    .update(schema.customerAddress)
    .set({
      isDefault: false,
      updatedAt: new Date(),
    })
    .where(eq(schema.customerAddress.customerId, customerId));

  await tx
    .update(schema.customerAddress)
    .set({
      isDefault: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.customerAddress.id, customerAddressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );
};

export const saveCheckoutDetails = async ({
  customerId,
  payload,
}: SaveCheckoutDetailsInput) =>
  database.transaction(async (tx) => {
    await tx
      .update(schema.customerProfile)
      .set({
        name: payload.recipientName,
        phone: payload.phone,
        updatedAt: new Date(),
      })
      .where(eq(schema.customerProfile.id, customerId));

    if (payload.mode !== "delivery" || !isNormalizedCheckoutPayload(payload)) {
      return { savedAddressId: null };
    }

    const selectedCustomerAddressId = payload.customerAddressId.trim();

    if (selectedCustomerAddressId) {
      if (payload.saveAsDefault) {
        await applyDefaultAddressSelection(
          tx,
          customerId,
          selectedCustomerAddressId
        );
      }

      return { savedAddressId: selectedCustomerAddressId };
    }

    const existingAddresses = await tx
      .select({ id: schema.customerAddress.id })
      .from(schema.customerAddress)
      .where(eq(schema.customerAddress.customerId, customerId))
      .limit(1);
    const shouldSetDefault =
      existingAddresses.length === 0 || payload.saveAsDefault;

    const [savedAddress] = await tx
      .insert(schema.customerAddress)
      .values({
        cityId: payload.cityId,
        countryId: payload.countryId,
        customerId,
        isDefault: shouldSetDefault,
        phone: payload.phone,
        postalCode: payload.postalCode || null,
        recipientName: payload.recipientName,
        referenceNote: payload.referenceNote || null,
        stateId: payload.stateId,
        streetLine1: payload.streetLine1,
        streetLine2: payload.streetLine2 || null,
      })
      .returning({ id: schema.customerAddress.id });

    if (payload.saveAsDefault && savedAddress) {
      await applyDefaultAddressSelection(tx, customerId, savedAddress.id);
    }

    return { savedAddressId: savedAddress?.id ?? null };
  });
