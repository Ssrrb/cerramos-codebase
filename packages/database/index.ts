import "server-only";

import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { keys } from "./keys";
import * as schema from "./schema";

const client = neon(keys().DATABASE_URL);

export const database = drizzle({ client, schema });

export { schema, sql };
