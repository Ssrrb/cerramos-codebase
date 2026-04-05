import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { expect, test } from "vitest";
import { keys } from "./keys";
import * as schema from "./schema";

const runDatabaseTest =
  process.env.RUN_DATABASE_TESTS === "1" && Boolean(process.env.DATABASE_URL);

const databaseTest = runDatabaseTest ? test : test.skip;
const database = drizzle({ client: neon(keys().DATABASE_URL), schema });

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
  const [productA] = await database
    .insert(schema.product)
    .values({
      category: "Categoria",
      commerceId: commerceA.id,
      deliveryIncluded: false,
      description: "Descripcion",
      image: "",
      images: {},
      name: `Producto A ${suffix}`,
      status: "active",
      stock: 10,
      unitPrice: 1000,
    })
    .returning({ id: schema.product.id });
  const [productB] = await database
    .insert(schema.product)
    .values({
      category: "Categoria",
      commerceId: commerceB.id,
      deliveryIncluded: false,
      description: "Descripcion",
      image: "",
      images: {},
      name: `Producto B ${suffix}`,
      status: "active",
      stock: 10,
      unitPrice: 1000,
    })
    .returning({ id: schema.product.id });

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
