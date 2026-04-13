import { neonConfig, Pool } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { WebSocket } from "undici";
import { expect, test } from "vitest";
import { keys } from "./keys";
import * as schema from "./schema";

const runDatabaseTest =
  process.env.RUN_DATABASE_TESTS === "1" && Boolean(process.env.DATABASE_URL);

const databaseTest = runDatabaseTest ? test : test.skip;
neonConfig.webSocketConstructor ??= WebSocket;

const database = drizzle({
  client: new Pool({
    connectionString: keys().DATABASE_URL,
  }),
  schema,
});

const createTextId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const insertProductWithPrimaryImage = async ({
  commerceId,
  description = "Descripcion",
  name,
  objectKey,
  status = "active" as const,
}: {
  commerceId: string;
  description?: string;
  name: string;
  objectKey: string;
  status?: "active" | "draft" | "inactive";
}) =>
  database.transaction(async (tx) => {
    const productId = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const productImageId = `product_image_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const [product] = await tx
      .insert(schema.product)
      .values({
        category: "Categoria",
        commerceId,
        deliveryIncluded: false,
        description,
        id: productId,
        name,
        primaryImageId: productImageId,
        status,
        stock: 10,
        unitPrice: 1000,
      })
      .returning({ id: schema.product.id });

    await tx.insert(schema.productImage).values({
      id: productImageId,
      objectKey,
      position: 0,
      productId,
    });

    return {
      id: product.id,
      primaryImageId: productImageId,
    };
  });

databaseTest("Page CRUD", async () => {
  const name = `vitest-${Date.now()}`;
  const [insertedPage] = await database
    .insert(schema.page)
    .values({ name })
    .returning({ id: schema.page.id, name: schema.page.name });

  expect(insertedPage.name).toBe(name);

  const pages = await database
    .select()
    .from(schema.page)
    .where(eq(schema.page.id, insertedPage.id));

  expect(pages).toHaveLength(1);
  expect(pages[0]?.name).toBe(name);

  const deletedPages = await database
    .delete(schema.page)
    .where(eq(schema.page.id, insertedPage.id))
    .returning({ id: schema.page.id });

  expect(deletedPages).toHaveLength(1);
  expect(deletedPages[0]?.id).toBe(insertedPage.id);
});

databaseTest("ProductLink constraints", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [commerceA] = await database
    .insert(schema.commerce)
    .values({
      name: `Commerce A ${suffix}`,
      slug: `commerce-a-${suffix}`,
    })
    .returning({ id: schema.commerce.id });
  const [commerceB] = await database
    .insert(schema.commerce)
    .values({
      name: `Commerce B ${suffix}`,
      slug: `commerce-b-${suffix}`,
    })
    .returning({ id: schema.commerce.id });
  const productA = await insertProductWithPrimaryImage({
    commerceId: commerceA.id,
    name: `Producto A ${suffix}`,
    objectKey: `products/${commerceA.id}/images/product-a-${suffix}.png`,
  });
  const productB = await insertProductWithPrimaryImage({
    commerceId: commerceB.id,
    name: `Producto B ${suffix}`,
    objectKey: `products/${commerceB.id}/images/product-b-${suffix}.png`,
  });

  const baseLinkValues = {
    currency: "PYG" as const,
    deliveryEnabled: true,
    paymentRequired: false,
    pickupEnabled: true,
    status: "draft" as const,
    title: "Link de prueba",
    unitPrice: 1000,
  };

  await database.insert(schema.productLink).values({
    ...baseLinkValues,
    commerceId: commerceA.id,
    productId: productA.id,
    slug: `link-${suffix}`,
  });

  await expect(
    database.insert(schema.productLink).values({
      ...baseLinkValues,
      commerceId: commerceA.id,
      productId: productA.id,
      slug: `otro-link-${suffix}`,
    })
  ).rejects.toMatchObject({
    cause: { code: "23505" },
  });

  await expect(
    database.insert(schema.productLink).values({
      ...baseLinkValues,
      commerceId: commerceA.id,
      productId: productB.id,
      slug: `cross-commerce-${suffix}`,
    })
  ).rejects.toMatchObject({
    cause: { code: "23503" },
  });

  await expect(
    database.insert(schema.productLink).values({
      ...baseLinkValues,
      commerceId: commerceA.id,
      productId: productA.id,
      slug: `link-${suffix}`,
    })
  ).rejects.toMatchObject({
    cause: { code: "23505" },
  });

  await expect(
    database.insert(schema.productLink).values({
      ...baseLinkValues,
      commerceId: commerceB.id,
      productId: productB.id,
      slug: `link-${suffix}`,
    })
  ).resolves.toBeDefined();
});

databaseTest("ProductImage constraints", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [commerce] = await database
    .insert(schema.commerce)
    .values({
      name: `Commerce ${suffix}`,
      slug: `commerce-${suffix}`,
    })
    .returning({ id: schema.commerce.id });
  const productA = await insertProductWithPrimaryImage({
    commerceId: commerce.id,
    name: `Producto A ${suffix}`,
    objectKey: `products/${commerce.id}/images/product-a-${suffix}.png`,
  });
  const productB = await insertProductWithPrimaryImage({
    commerceId: commerce.id,
    name: `Producto B ${suffix}`,
    objectKey: `products/${commerce.id}/images/product-b-${suffix}.png`,
  });

  await expect(
    database.insert(schema.productImage).values({
      objectKey: `products/${commerce.id}/images/product-a-secondary-${suffix}.png`,
      position: 0,
      productId: productA.id,
    })
  ).rejects.toMatchObject({
    cause: { code: "23505" },
  });

  await expect(
    database
      .update(schema.product)
      .set({
        primaryImageId: productB.primaryImageId,
      })
      .where(eq(schema.product.id, productA.id))
  ).rejects.toMatchObject({
    cause: { code: "23503" },
  });
});

databaseTest(
  "profile tables allow guest buyers and dual-profile users",
  async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const guestEmail = `guest-${suffix}@example.com`;
    const linkedEmail = `linked-${suffix}@example.com`;
    const merchantEmail = `merchant-${suffix}@example.com`;

    const [guestProfile] = await database
      .insert(schema.customerProfile)
      .values({
        email: guestEmail,
        name: "Guest Buyer",
        phone: "0981000000",
      })
      .returning({
        id: schema.customerProfile.id,
        userId: schema.customerProfile.userId,
      });

    expect(guestProfile.userId).toBeNull();

    const [commerce] = await database
      .insert(schema.commerce)
      .values({
        name: `Commerce ${suffix}`,
        slug: `commerce-${suffix}`,
      })
      .returning({ id: schema.commerce.id });

    const customerProfileId = createTextId("customer_profile");

    await database.insert(schema.customerProfile).values({
      email: linkedEmail,
      id: customerProfileId,
      name: "Linked Buyer",
      phone: "0981222333",
    });

    const userId = createTextId("user");

    await database.insert(schema.user).values({
      commerceId: commerce.id,
      customerId: customerProfileId,
      email: merchantEmail,
      id: userId,
      image: "https://example.com/avatar.png",
      name: "Merchant Owner",
    });

    const [linkedProfile] = await database
      .select({
        email: schema.customerProfile.email,
        id: schema.customerProfile.id,
        image: schema.customerProfile.image,
        userId: schema.customerProfile.userId,
      })
      .from(schema.customerProfile)
      .where(eq(schema.customerProfile.id, customerProfileId));

    const [merchantProfile] = await database
      .select({
        commerceId: schema.merchantProfile.commerceId,
        legalFullName: schema.merchantProfile.legalFullName,
        role: schema.merchantProfile.role,
        userId: schema.merchantProfile.userId,
      })
      .from(schema.merchantProfile)
      .where(eq(schema.merchantProfile.userId, userId));

    expect(linkedProfile).toMatchObject({
      email: merchantEmail,
      id: customerProfileId,
      image: "https://example.com/avatar.png",
      userId,
    });
    expect(merchantProfile).toMatchObject({
      commerceId: commerce.id,
      legalFullName: "Merchant Owner",
      role: "owner",
      userId,
    });
  }
);

databaseTest(
  "orders and delivery records still attach to customer profiles",
  async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const [commerce] = await database
      .insert(schema.commerce)
      .values({
        name: `Order Commerce ${suffix}`,
        slug: `order-commerce-${suffix}`,
      })
      .returning({ id: schema.commerce.id });

    const productRecord = await insertProductWithPrimaryImage({
      commerceId: commerce.id,
      name: `Producto ${suffix}`,
      objectKey: `products/${commerce.id}/images/product-${suffix}.png`,
    });

    const [productLink] = await database
      .insert(schema.productLink)
      .values({
        commerceId: commerce.id,
        currency: "PYG",
        deliveryEnabled: true,
        paymentRequired: false,
        pickupEnabled: true,
        productId: productRecord.id,
        slug: `product-link-${suffix}`,
        status: "active",
        title: `Link ${suffix}`,
        unitPrice: 1000,
      })
      .returning({ id: schema.productLink.id });

    const customerProfileId = createTextId("customer_profile");

    await database.insert(schema.customerProfile).values({
      email: `buyer-${suffix}@example.com`,
      id: customerProfileId,
      name: "Buyer Profile",
      phone: "0981444555",
    });

    const [deliveryInfo] = await database
      .insert(schema.deliveryInfo)
      .values({
        addressLine1: "Calle Principal 123",
        city: "Asuncion",
        customerId: customerProfileId,
        email: `buyer-${suffix}@example.com`,
        mode: "delivery",
        phone: "0981444555",
        recipientName: "Buyer Profile",
      })
      .returning({ id: schema.deliveryInfo.id });

    const [order] = await database
      .insert(schema.order)
      .values({
        commerceId: commerce.id,
        currency: "PYG",
        customerId: customerProfileId,
        deliveryInfoId: deliveryInfo.id,
        expiresAt: new Date(Date.now() + 86_400_000),
        fulfillmentType: "delivery",
        productLinkId: productLink.id,
        quantity: 1,
        subtotal: 1000,
        total: 1000,
      })
      .returning({ id: schema.order.id });

    const [resolvedOrder] = await database
      .select({
        customerEmail: schema.customerProfile.email,
        customerId: schema.customerProfile.id,
        deliveryInfoId: schema.deliveryInfo.id,
        orderId: schema.order.id,
      })
      .from(schema.order)
      .innerJoin(
        schema.customerProfile,
        eq(schema.order.customerId, schema.customerProfile.id)
      )
      .innerJoin(
        schema.deliveryInfo,
        eq(schema.order.deliveryInfoId, schema.deliveryInfo.id)
      )
      .where(eq(schema.order.id, order.id));

    expect(resolvedOrder).toMatchObject({
      customerEmail: `buyer-${suffix}@example.com`,
      customerId: customerProfileId,
      deliveryInfoId: deliveryInfo.id,
      orderId: order.id,
    });
  }
);

databaseTest("user mirror updates keep profile tables in sync", async () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [commerceA] = await database
    .insert(schema.commerce)
    .values({
      name: `Commerce A ${suffix}`,
      slug: `commerce-a-sync-${suffix}`,
    })
    .returning({ id: schema.commerce.id });
  const [commerceB] = await database
    .insert(schema.commerce)
    .values({
      name: `Commerce B ${suffix}`,
      slug: `commerce-b-sync-${suffix}`,
    })
    .returning({ id: schema.commerce.id });

  const customerProfileAId = createTextId("customer_profile");
  const customerProfileBId = createTextId("customer_profile");

  await database.insert(schema.customerProfile).values([
    {
      email: `buyer-a-${suffix}@example.com`,
      id: customerProfileAId,
      name: "Buyer A",
    },
    {
      email: `buyer-b-${suffix}@example.com`,
      id: customerProfileBId,
      name: "Buyer B",
    },
  ]);

  const userId = createTextId("user");

  await database.insert(schema.user).values({
    commerceId: commerceA.id,
    customerId: customerProfileAId,
    email: `merchant-sync-${suffix}@example.com`,
    id: userId,
    name: "Sync Merchant",
  });

  await database
    .update(schema.user)
    .set({
      commerceId: commerceB.id,
      customerId: customerProfileBId,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));

  const [originalProfile] = await database
    .select({ userId: schema.customerProfile.userId })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.id, customerProfileAId));
  const [updatedProfile] = await database
    .select({ userId: schema.customerProfile.userId })
    .from(schema.customerProfile)
    .where(eq(schema.customerProfile.id, customerProfileBId));
  const [merchantProfile] = await database
    .select({ commerceId: schema.merchantProfile.commerceId })
    .from(schema.merchantProfile)
    .where(eq(schema.merchantProfile.userId, userId));

  expect(originalProfile?.userId).toBeNull();
  expect(updatedProfile?.userId).toBe(userId);
  expect(merchantProfile?.commerceId).toBe(commerceB.id);

  await expect(
    database.insert(schema.user).values({
      commerceId: commerceB.id,
      email: `merchant-conflict-${suffix}@example.com`,
      id: createTextId("user"),
      name: "Conflict Merchant",
    })
  ).rejects.toMatchObject({
    cause: { code: "23505" },
  });
});
