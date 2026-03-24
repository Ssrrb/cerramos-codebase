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
