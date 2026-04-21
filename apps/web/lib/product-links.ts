import {
  and,
  database,
  eq,
  gte,
  isMissingRelationError,
  schema,
  sql,
} from "@repo/database";
import {
  extractProductImageObjectKey,
  normalizeStoredProductImageReference,
} from "@repo/storage/product-image";
import { cache } from "react";
import { z } from "zod";
import { normalizeCheckoutCommerceLogoUrl } from "@/lib/commerce";

const checkoutOrderPayloadBaseSchema = z.object({
  email: z.string().trim().email({ message: "Ingresa un email valido." }),
  mode: z.enum(["delivery", "pickup"], {
    error: "Selecciona una modalidad valida.",
  }),
  notes: z.string().trim().max(400).default(""),
  phone: z.string().trim().min(1, {
    message: "Ingresa un telefono valido.",
  }),
  quantity: z.coerce.number().int().min(1, {
    message: "Selecciona una cantidad valida.",
  }),
  recipientName: z.string().trim().min(1, {
    message: "Ingresa el nombre de quien recibe el pedido.",
  }),
});

const normalizedCheckoutOrderPayloadSchema = checkoutOrderPayloadBaseSchema
  .extend({
    countryId: z.string().trim().max(64).default(""),
    stateId: z.string().trim().max(64).default(""),
    cityId: z.string().trim().max(64).default(""),
    customerAddressId: z.string().trim().max(64).default(""),
    saveAddress: z.boolean().default(false),
    saveAsDefault: z.boolean().default(false),
    streetLine1: z.string().trim().max(160).default(""),
    streetLine2: z.string().trim().max(160).default(""),
    postalCode: z.string().trim().max(32).default(""),
    referenceNote: z.string().trim().max(160).default(""),
  })
  .superRefine((value, context) => {
    if (value.mode !== "delivery") {
      return;
    }

    if (!value.countryId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicá el pais de entrega.",
        path: ["countryId"],
      });
    }

    if (!value.stateId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicá el departamento o estado de entrega.",
        path: ["stateId"],
      });
    }

    if (!value.cityId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicá la ciudad de entrega.",
        path: ["cityId"],
      });
    }

    if (!value.streetLine1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá la direccion de entrega.",
        path: ["streetLine1"],
      });
    }
  });

const legacyCheckoutOrderPayloadSchema = checkoutOrderPayloadBaseSchema
  .extend({
    addressLine1: z.string().trim().max(160).default(""),
    addressLine2: z.string().trim().max(160).default(""),
    city: z.string().trim().max(120).default(""),
    customerAddressId: z.string().trim().max(64).default(""),
    reference: z.string().trim().max(160).default(""),
    saveAddress: z.boolean().default(false),
    saveAsDefault: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (value.mode !== "delivery") {
      return;
    }

    if (!value.city) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicá la ciudad de entrega.",
        path: ["city"],
      });
    }

    if (!value.addressLine1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresá la direccion de entrega.",
        path: ["addressLine1"],
      });
    }
  });

export const checkoutOrderPayloadSchema = z.union([
  normalizedCheckoutOrderPayloadSchema,
  legacyCheckoutOrderPayloadSchema,
]);

export type CheckoutOrderPayload = z.infer<typeof checkoutOrderPayloadSchema>;

export interface ProductLinkCheckoutRecord {
  commerceId: string;
  commerceLogoImageUrl: string | null;
  commerceName: string;
  commerceSlug: string;
  currency: string;
  defaultOrderExpiryHours: number;
  deliveryEnabled: boolean;
  description: string | null;
  expiresAt: Date | null;
  imageReference: string | null;
  imageUrl: string | null;
  paymentRequired: boolean;
  pickupEnabled: boolean;
  productId: string;
  productLinkId: string;
  slug: string;
  stock: number;
  title: string;
  trustState:
    | "pending_review"
    | "verified"
    | "limited"
    | "rejected"
    | "suspended";
  unitPrice: number;
}

export interface CreateOrderResult {
  orderId: string;
  paymentIntentId: string | null;
  paymentRequired: boolean;
  upayFormId: string | null;
}

export interface AuthenticatedCheckoutBuyer {
  customerId?: string | null;
  userId: string;
}

export class ProductLinkCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductLinkCheckoutError";
  }
}

const formatPriceLabel = (value: number) =>
  `Gs. ${new Intl.NumberFormat("es-PY").format(value)}`;

const OUT_OF_STOCK_ERROR = "Este producto se quedó sin stock.";
const EXCEEDS_STOCK_ERROR =
  "La cantidad seleccionada supera el stock disponible.";
const PARAGUAY_ISO_CODE_2 = "PY";
const LEGACY_PARAGUAY_CITY_ALIASES: Record<string, string> = {
  mariano: "mariano roque alonso",
};

interface ResolvedDeliveryAddress {
  cityId: string | null;
  customerAddressId: string | null;
  countryId: string | null;
  postalCode: string | null;
  referenceNote: string | null;
  stateId: string | null;
  streetLine1: string | null;
  streetLine2: string | null;
}

interface SavedCustomerAddressRecord {
  cityId: string;
  countryId: string;
  customerId: string;
  id: string;
  isDefault: boolean;
  label: string | null;
  phone: string | null;
  postalCode: string | null;
  recipientName: string | null;
  referenceNote: string | null;
  stateId: string;
  streetLine1: string;
  streetLine2: string | null;
}

const buildPublicProductImagePath = (objectKey: string) =>
  `/api/product-link-images?objectKey=${encodeURIComponent(objectKey)}`;

const normalizeCheckoutProductImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) {
    return null;
  }

  const normalizedReference = normalizeStoredProductImageReference(
    imageUrl,
    process.env.GCS_BUCKET_NAME
  );
  const objectKey = getPublicProductImageObjectKey(
    normalizedReference,
    process.env.GCS_BUCKET_NAME
  );

  if (!objectKey) {
    return normalizedReference || imageUrl;
  }

  // Public checkout pages cannot rely on raw bucket URLs or signed URLs being
  // stable, so canonical object keys are always rewritten through our proxy.
  return buildPublicProductImagePath(objectKey);
};

const resolveCheckoutProductImage = (
  candidate: string | null | undefined
): { imageReference: string | null; imageUrl: string | null } => {
  const normalizedReference = normalizeStoredProductImageReference(
    candidate,
    process.env.GCS_BUCKET_NAME
  );

  if (normalizedReference) {
    return {
      imageReference: normalizedReference,
      imageUrl: normalizeCheckoutProductImageUrl(normalizedReference),
    };
  }

  return {
    imageReference: null,
    imageUrl: null,
  };
};

export const getPublicProductLinkCheckout = cache(
  async (
    commerceSlug: string,
    productLinkSlug: string
  ): Promise<ProductLinkCheckoutRecord | null> => {
    let record:
      | {
          commerceId: string;
          commerceLogoImageUrl: string | null;
          commerceName: string;
          commerceSlug: string;
          currency: string;
          defaultOrderExpiryHours: number;
          deliveryEnabled: boolean;
          description: string | null;
          expiresAt: Date | null;
          imageObjectKey: string | null;
          paymentRequired: boolean;
          pickupEnabled: boolean;
          productId: string;
          productLinkId: string;
          productLinkStatus: "active" | "draft" | "expired" | "inactive";
          productStatus: "active" | "draft" | "inactive";
          slug: string;
          stock: number;
          title: string;
          trustState:
            | "limited"
            | "pending_review"
            | "rejected"
            | "suspended"
            | "verified";
          unitPrice: number;
        }
      | undefined;

    try {
      [record] = await database
        .select({
          commerceId: schema.commerce.id,
          commerceLogoImageUrl: schema.commerce.logoImageUrl,
          commerceName: schema.commerce.name,
          commerceSlug: schema.commerce.slug,
          currency: schema.productLink.currency,
          defaultOrderExpiryHours: schema.commerce.defaultOrderExpiryHours,
          deliveryEnabled: schema.productLink.deliveryEnabled,
          description: schema.productLink.description,
          expiresAt: schema.productLink.expiresAt,
          imageObjectKey: schema.productImage.objectKey,
          paymentRequired: schema.productLink.paymentRequired,
          pickupEnabled: schema.productLink.pickupEnabled,
          productId: schema.product.id,
          productLinkId: schema.productLink.id,
          productStatus: schema.product.status,
          productLinkStatus: schema.productLink.status,
          slug: schema.productLink.slug,
          stock: schema.product.stock,
          title: schema.productLink.title,
          trustState: schema.commerce.trustState,
          unitPrice: schema.productLink.unitPrice,
        })
        .from(schema.commerce)
        .innerJoin(
          schema.productLink,
          and(
            eq(schema.productLink.commerceId, schema.commerce.id),
            eq(schema.productLink.slug, productLinkSlug)
          )
        )
        .innerJoin(
          schema.product,
          eq(schema.product.id, schema.productLink.productId)
        )
        .leftJoin(
          schema.productImage,
          // Checkout tolerates products whose image row is temporarily missing
          // or inconsistent. Matching both keys keeps the join aligned with the
          // composite FK used by Product.primaryImageId.
          and(
            eq(schema.productImage.id, schema.product.primaryImageId),
            eq(schema.productImage.productId, schema.product.id)
          )
        )
        .where(eq(schema.commerce.slug, commerceSlug));
    } catch (error) {
      if (isMissingRelationError(error, "ProductLink")) {
        return null;
      }

      throw error;
    }

    if (!record) {
      return null;
    }

    if (record.productLinkStatus !== "active") {
      return null;
    }

    if (record.productStatus !== "active") {
      return null;
    }

    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const productImage = resolveCheckoutProductImage(record.imageObjectKey);

    return {
      commerceId: record.commerceId,
      commerceLogoImageUrl: normalizeCheckoutCommerceLogoUrl(
        record.commerceLogoImageUrl
      ),
      commerceName: record.commerceName,
      commerceSlug: record.commerceSlug,
      currency: record.currency,
      defaultOrderExpiryHours: record.defaultOrderExpiryHours,
      deliveryEnabled: record.deliveryEnabled,
      description: record.description,
      expiresAt: record.expiresAt,
      imageReference: productImage.imageReference,
      imageUrl: productImage.imageUrl,
      paymentRequired: record.paymentRequired,
      pickupEnabled: record.pickupEnabled,
      productId: record.productId,
      productLinkId: record.productLinkId,
      slug: record.slug,
      stock: record.stock,
      title: record.title,
      trustState: record.trustState,
      unitPrice: record.unitPrice,
    };
  }
);

export const createCheckoutViewModel = (record: ProductLinkCheckoutRecord) => ({
  merchant: {
    avatarUrl: record.commerceLogoImageUrl,
    name: record.commerceName,
    trustState: record.trustState,
  },
  orderSummary: {
    badgeLabel: "",
    helperText:
      "El pedido se crea con snapshot inmutable y el servidor vuelve a validar precio, disponibilidad y vigencia.",
    rows: [
      {
        label: "Modalidades",
        value: [
          record.deliveryEnabled ? "delivery" : null,
          record.pickupEnabled ? "retiro" : null,
        ]
          .filter(Boolean)
          .join(" + "),
      },
    ],
    shippingLabel: "A coordinar",
    subtotalLabel: formatPriceLabel(record.unitPrice),
    title: "Tu pedido",
    totalLabel: formatPriceLabel(record.unitPrice),
  },
  product: {
    availableStock: record.stock,
    description:
      record.description ??
      "Oferta publicada desde Cerramos para cerrar el pedido sin salir de la misma URL.",
    imageUrl: record.imageUrl ?? "",
    name: record.title,
    priceLabel: formatPriceLabel(record.unitPrice),
    quantity: 1,
    unitPrice: record.unitPrice,
  },
});

export const getPublicProductImageObjectKey = (
  value: string | null,
  bucketName?: string
) => {
  if (!value) {
    return "";
  }

  return extractProductImageObjectKey(value.trim(), bucketName);
};

const getAuthenticatedCustomerProfile = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  authenticatedBuyer: AuthenticatedCheckoutBuyer
) => {
  if (authenticatedBuyer.customerId) {
    const [customerProfile] = await tx
      .select({
        email: schema.customerProfile.email,
        id: schema.customerProfile.id,
        name: schema.customerProfile.name,
      })
      .from(schema.customerProfile)
      .where(eq(schema.customerProfile.id, authenticatedBuyer.customerId));

    if (customerProfile) {
      return customerProfile;
    }
  }

  const [customerProfile] = await tx
    .select({
      email: schema.customerProfile.email,
      id: schema.customerProfile.id,
      name: schema.customerProfile.name,
    })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.userId, authenticatedBuyer.userId));

  return customerProfile ?? null;
};

const normalizeLocationKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const resolveOrderCustomerProfile = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  payload: CheckoutOrderPayload,
  authenticatedBuyer?: AuthenticatedCheckoutBuyer
) => {
  if (authenticatedBuyer) {
    const linkedCustomerProfile = await getAuthenticatedCustomerProfile(
      tx,
      authenticatedBuyer
    );

    if (linkedCustomerProfile) {
      const [customerProfile] = await tx
        .update(schema.customerProfile)
        .set({
          email: linkedCustomerProfile.email ?? payload.email,
          name: linkedCustomerProfile.name ?? payload.recipientName,
          phone: payload.phone,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerProfile.id, linkedCustomerProfile.id))
        .returning({
          id: schema.customerProfile.id,
        });

      return customerProfile;
    }
  }

  const [existingCustomerProfile] = await tx
    .select({
      id: schema.customerProfile.id,
    })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.email, payload.email));

  const [customerProfile] = existingCustomerProfile
    ? await tx
        .update(schema.customerProfile)
        .set({
          email: payload.email,
          name: payload.recipientName,
          phone: payload.phone,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerProfile.id, existingCustomerProfile.id))
        .returning({
          id: schema.customerProfile.id,
        })
    : await tx
        .insert(schema.customerProfile)
        .values({
          email: payload.email,
          name: payload.recipientName,
          phone: payload.phone,
        })
        .returning({
          id: schema.customerProfile.id,
        });

  return customerProfile;
};

const resolveDeliveryAddress = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  payload: CheckoutOrderPayload
): Promise<ResolvedDeliveryAddress> => {
  if (payload.mode === "pickup") {
    return {
      cityId: null,
      customerAddressId: null,
      countryId: null,
      postalCode: null,
      referenceNote: null,
      stateId: null,
      streetLine1: null,
      streetLine2: null,
    };
  }

  if ("countryId" in payload) {
    const [resolvedCity] = await tx
      .select({
        cityId: schema.city.id,
        countryId: schema.country.id,
        stateId: schema.state.id,
      })
      .from(schema.city)
      .innerJoin(schema.state, eq(schema.city.stateId, schema.state.id))
      .innerJoin(schema.country, eq(schema.state.countryId, schema.country.id))
      .where(eq(schema.city.id, payload.cityId));

    if (
      !resolvedCity ||
      resolvedCity.stateId !== payload.stateId ||
      resolvedCity.countryId !== payload.countryId
    ) {
      throw new ProductLinkCheckoutError(
        "La ciudad de entrega no coincide con el departamento y pais seleccionados."
      );
    }

    return {
      cityId: payload.cityId,
      customerAddressId: null,
      countryId: payload.countryId,
      postalCode: payload.postalCode || null,
      referenceNote: payload.referenceNote || null,
      stateId: payload.stateId,
      streetLine1: payload.streetLine1,
      streetLine2: payload.streetLine2 || null,
    };
  }

  // TODO: remove this legacy Paraguay resolver after checkout submits
  // canonical country/state/city ids instead of hardcoded city/barrio values.
  const paraguayCities = await tx
    .select({
      cityId: schema.city.id,
      cityName: schema.city.name,
      countryId: schema.country.id,
      stateId: schema.state.id,
    })
    .from(schema.city)
    .innerJoin(schema.state, eq(schema.city.stateId, schema.state.id))
    .innerJoin(schema.country, eq(schema.state.countryId, schema.country.id))
    .where(eq(schema.country.isoCode2, PARAGUAY_ISO_CODE_2));

  const requestedCityKey = normalizeLocationKey(payload.city);
  const canonicalCityKey =
    LEGACY_PARAGUAY_CITY_ALIASES[requestedCityKey] ?? requestedCityKey;
  const resolvedCity = paraguayCities.find(
    (candidate) => normalizeLocationKey(candidate.cityName) === canonicalCityKey
  );

  if (!resolvedCity) {
    throw new ProductLinkCheckoutError("Indicá una ciudad de entrega valida.");
  }

  return {
    cityId: resolvedCity.cityId,
    customerAddressId: null,
    countryId: resolvedCity.countryId,
    postalCode: null,
    referenceNote: payload.reference || null,
    stateId: resolvedCity.stateId,
    streetLine1: payload.addressLine1,
    streetLine2: payload.addressLine2 || null,
  };
};

const resolveSelectedCustomerAddress = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  customerId: string,
  customerAddressId: string
): Promise<SavedCustomerAddressRecord> => {
  const [savedAddress] = await tx
    .select({
      cityId: schema.customerAddress.cityId,
      countryId: schema.customerAddress.countryId,
      customerId: schema.customerAddress.customerId,
      id: schema.customerAddress.id,
      isDefault: schema.customerAddress.isDefault,
      label: schema.customerAddress.label,
      phone: schema.customerAddress.phone,
      postalCode: schema.customerAddress.postalCode,
      recipientName: schema.customerAddress.recipientName,
      referenceNote: schema.customerAddress.referenceNote,
      stateId: schema.customerAddress.stateId,
      streetLine1: schema.customerAddress.streetLine1,
      streetLine2: schema.customerAddress.streetLine2,
    })
    .from(schema.customerAddress)
    .where(
      and(
        eq(schema.customerAddress.id, customerAddressId),
        eq(schema.customerAddress.customerId, customerId)
      )
    );

  if (!savedAddress) {
    throw new ProductLinkCheckoutError(
      "La direccion guardada seleccionada no existe para este usuario."
    );
  }

  return savedAddress;
};

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

const persistCustomerAddressForCheckout = async (
  tx: Parameters<Parameters<typeof database.transaction>[0]>[0],
  customerId: string,
  payload: CheckoutOrderPayload
): Promise<SavedCustomerAddressRecord | null> => {
  if (payload.mode !== "delivery" || !("countryId" in payload)) {
    return null;
  }

  const [savedAddress] = await tx
    .insert(schema.customerAddress)
    .values({
      cityId: payload.cityId,
      countryId: payload.countryId,
      customerId,
      isDefault: payload.saveAsDefault,
      phone: payload.phone,
      postalCode: payload.postalCode || null,
      recipientName: payload.recipientName,
      referenceNote: payload.referenceNote || null,
      stateId: payload.stateId,
      streetLine1: payload.streetLine1,
      streetLine2: payload.streetLine2 || null,
    })
    .returning({
      cityId: schema.customerAddress.cityId,
      countryId: schema.customerAddress.countryId,
      customerId: schema.customerAddress.customerId,
      id: schema.customerAddress.id,
      isDefault: schema.customerAddress.isDefault,
      label: schema.customerAddress.label,
      phone: schema.customerAddress.phone,
      postalCode: schema.customerAddress.postalCode,
      recipientName: schema.customerAddress.recipientName,
      referenceNote: schema.customerAddress.referenceNote,
      stateId: schema.customerAddress.stateId,
      streetLine1: schema.customerAddress.streetLine1,
      streetLine2: schema.customerAddress.streetLine2,
    });

  if (payload.saveAsDefault) {
    await applyDefaultAddressSelection(tx, customerId, savedAddress.id);
    return {
      ...savedAddress,
      isDefault: true,
    };
  }

  return savedAddress;
};

export const createOrderFromProductLink = async (
  commerceSlug: string,
  productLinkSlug: string,
  payload: CheckoutOrderPayload,
  authenticatedBuyer?: AuthenticatedCheckoutBuyer
): Promise<CreateOrderResult | null> => {
  const record = await getPublicProductLinkCheckout(
    commerceSlug,
    productLinkSlug
  );

  if (!record) {
    return null;
  }

  if (payload.mode === "delivery" && !record.deliveryEnabled) {
    throw new ProductLinkCheckoutError("Este link no permite delivery.");
  }

  if (payload.mode === "pickup" && !record.pickupEnabled) {
    throw new ProductLinkCheckoutError("Este link no permite retiro.");
  }

  if (record.paymentRequired && record.trustState !== "verified") {
    throw new ProductLinkCheckoutError(
      "El pago online todavia no esta disponible para este link."
    );
  }

  const expiresAt = new Date(
    Date.now() + record.defaultOrderExpiryHours * 60 * 60 * 1000
  );
  const totalAmount = record.unitPrice * payload.quantity;

  return database.transaction(async (tx) => {
    const [productSnapshot] = await tx
      .select({
        stock: schema.product.stock,
      })
      .from(schema.product)
      .where(eq(schema.product.id, record.productId));

    if (!productSnapshot || productSnapshot.stock <= 0) {
      throw new ProductLinkCheckoutError(OUT_OF_STOCK_ERROR);
    }

    if (payload.quantity > productSnapshot.stock) {
      throw new ProductLinkCheckoutError(EXCEEDS_STOCK_ERROR);
    }

    const [reservedProduct] = await tx
      .update(schema.product)
      .set({
        stock: sql`${schema.product.stock} - ${payload.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.product.id, record.productId),
          gte(schema.product.stock, payload.quantity)
        )
      )
      .returning({
        stock: schema.product.stock,
      });

    if (!reservedProduct) {
      const [currentProduct] = await tx
        .select({
          stock: schema.product.stock,
        })
        .from(schema.product)
        .where(eq(schema.product.id, record.productId));

      throw new ProductLinkCheckoutError(
        currentProduct && currentProduct.stock > 0
          ? EXCEEDS_STOCK_ERROR
          : OUT_OF_STOCK_ERROR
      );
    }

    const customerProfile = await resolveOrderCustomerProfile(
      tx,
      payload,
      authenticatedBuyer
    );
    const requestedCustomerAddressId = payload.customerAddressId?.trim();
    const selectedCustomerAddress =
      payload.mode === "delivery" && requestedCustomerAddressId
        ? authenticatedBuyer
          ? await resolveSelectedCustomerAddress(
              tx,
              customerProfile.id,
              requestedCustomerAddressId
            )
          : (() => {
              throw new ProductLinkCheckoutError(
                "Necesitas iniciar sesion para usar direcciones guardadas."
              );
            })()
        : null;

    const deliveryAddress = selectedCustomerAddress
      ? {
          cityId: selectedCustomerAddress.cityId,
          customerAddressId: selectedCustomerAddress.id,
          countryId: selectedCustomerAddress.countryId,
          postalCode: selectedCustomerAddress.postalCode,
          referenceNote: selectedCustomerAddress.referenceNote,
          stateId: selectedCustomerAddress.stateId,
          streetLine1: selectedCustomerAddress.streetLine1,
          streetLine2: selectedCustomerAddress.streetLine2,
        }
      : await resolveDeliveryAddress(tx, payload);

    let savedCustomerAddress = selectedCustomerAddress;

    if (payload.mode === "delivery" && (payload.saveAddress || payload.saveAsDefault)) {
      if (!authenticatedBuyer) {
        throw new ProductLinkCheckoutError(
          "Necesitas iniciar sesion para guardar direcciones."
        );
      }

      if (selectedCustomerAddress) {
        if (payload.saveAsDefault && !selectedCustomerAddress.isDefault) {
          await applyDefaultAddressSelection(
            tx,
            customerProfile.id,
            selectedCustomerAddress.id
          );
          savedCustomerAddress = {
            ...selectedCustomerAddress,
            isDefault: true,
          };
        }
      } else if ("countryId" in payload && payload.saveAddress) {
        if (payload.saveAsDefault) {
          await tx
            .update(schema.customerAddress)
            .set({
              isDefault: false,
              updatedAt: new Date(),
            })
            .where(eq(schema.customerAddress.customerId, customerProfile.id));
        }

        savedCustomerAddress = await persistCustomerAddressForCheckout(
          tx,
          customerProfile.id,
          payload
        );
      }
    }

    const [deliveryInfo] = await tx
      .insert(schema.deliveryInfo)
      .values({
        cityId: deliveryAddress.cityId,
        countryId: deliveryAddress.countryId,
        customerAddressId:
          savedCustomerAddress?.id ?? deliveryAddress.customerAddressId,
        customerId: customerProfile.id,
        email: payload.email,
        mode: payload.mode,
        notes: payload.notes || null,
        postalCode: deliveryAddress.postalCode,
        phone: payload.phone,
        referenceNote: deliveryAddress.referenceNote,
        recipientName: payload.recipientName,
        stateId: deliveryAddress.stateId,
        streetLine1: deliveryAddress.streetLine1,
        streetLine2: deliveryAddress.streetLine2,
      })
      .returning({
        id: schema.deliveryInfo.id,
      });

    const orderStatus = record.paymentRequired ? "pending_payment" : "new";
    const paymentStatus = record.paymentRequired ? "pending" : "not_required";

    const [order] = await tx
      .insert(schema.order)
      .values({
        commerceId: record.commerceId,
        customerId: customerProfile.id,
        deliveryInfoId: deliveryInfo.id,
        expiresAt,
        orderStatus,
        paymentStatus,
        productLinkId: record.productLinkId,
        quantity: payload.quantity,
        subtotal: totalAmount,
        total: totalAmount,
        currency: record.currency,
      })
      .returning({
        id: schema.order.id,
      });

    await tx.insert(schema.orderItem).values({
      description: record.description,
      imageObjectKey: record.imageReference,
      orderId: order.id,
      productId: record.productId,
      productLinkId: record.productLinkId,
      quantity: payload.quantity,
      title: record.title,
      totalPrice: totalAmount,
      unitPrice: record.unitPrice,
      variantLabel: null,
    });

    await tx.insert(schema.orderStatusHistory).values({
      changedByType: "buyer",
      orderId: order.id,
      reason: "checkout_created",
      toStatus: orderStatus,
    });

    let paymentIntentId: string | null = null;

    if (record.paymentRequired) {
      const [paymentIntent] = await tx
        .insert(schema.paymentIntent)
        .values({
          amount: totalAmount,
          currency: record.currency,
          expiresAt,
          method: null,
          orderId: order.id,
          provider: "pagopar_upay",
          providerMetadata: {
            commerceSlug: record.commerceSlug,
            productLinkSlug: record.slug,
          },
          status: "pending",
        })
        .returning({
          id: schema.paymentIntent.id,
        });

      paymentIntentId = paymentIntent.id;
    }

    return {
      orderId: order.id,
      paymentIntentId,
      paymentRequired: record.paymentRequired,
      upayFormId: paymentIntentId,
    };
  });
};

export const releaseReservedStockForOrder = async (
  orderId: string,
  nextStatus: "cancelled" | "expired"
) =>
  database.transaction(async (tx) => {
    const [existingOrder] = await tx
      .select({
        orderId: schema.order.id,
        orderStatus: schema.order.orderStatus,
        quantity: schema.order.quantity,
        productId: schema.orderItem.productId,
      })
      .from(schema.order)
      .innerJoin(
        schema.orderItem,
        eq(schema.orderItem.orderId, schema.order.id)
      )
      .where(eq(schema.order.id, orderId));

    if (!existingOrder) {
      return null;
    }

    if (
      existingOrder.orderStatus === nextStatus ||
      existingOrder.orderStatus === "cancelled" ||
      existingOrder.orderStatus === "expired"
    ) {
      return {
        orderId,
        released: false,
      };
    }

    const now = new Date();

    await tx
      .update(schema.order)
      .set({
        cancelledAt: nextStatus === "cancelled" ? now : null,
        orderStatus: nextStatus,
        updatedAt: now,
      })
      .where(eq(schema.order.id, orderId));

    await tx
      .update(schema.product)
      .set({
        stock: sql`${schema.product.stock} + ${existingOrder.quantity}`,
        updatedAt: now,
      })
      .where(eq(schema.product.id, existingOrder.productId));

    await tx.insert(schema.orderStatusHistory).values({
      changedByType: "system",
      fromStatus: existingOrder.orderStatus,
      orderId,
      reason: `stock_released_${nextStatus}`,
      toStatus: nextStatus,
    });

    return {
      orderId,
      released: true,
    };
  });
