import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { WebSocket } from "undici";
import { keys } from "./keys";
import * as schema from "./schema";

neonConfig.webSocketConstructor ??= WebSocket;

const client = new Pool({
  connectionString: keys().DATABASE_URL,
});

export const database = drizzle({ client, schema });

export { schema, sql };
