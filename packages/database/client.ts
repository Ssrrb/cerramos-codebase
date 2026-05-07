import { neonConfig, Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { keys } from "./keys";
import * as schema from "./schema";

neonConfig.webSocketConstructor ??= globalThis.WebSocket;

const client = new Pool({
  connectionString: keys().DATABASE_URL,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 5,
});

export const database = drizzle({ client, schema });

export const warmDatabaseConnection = async (): Promise<void> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await database.execute(sql`SELECT 1`);
      return;
    } catch (error) {
      lastError = error;

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError;
};

export { schema, sql };
