import { database, schema } from "@repo/database";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const [newPage] = await database
    .insert(schema.page)
    .values({
      name: "cron-temp",
    })
    .returning({ id: schema.page.id });

  await database.delete(schema.page).where(eq(schema.page.id, newPage.id));

  return new Response("OK", { status: 200 });
};
