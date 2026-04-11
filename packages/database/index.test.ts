import { Pool, neonConfig } from "@neondatabase/serverless";
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
