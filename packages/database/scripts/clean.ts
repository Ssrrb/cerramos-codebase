import { database, sql } from "../client";

type TableRow = {
  tablename: string;
};

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`;

const result = await database.execute<TableRow>(sql`
  select tablename
  from pg_tables
  where schemaname = 'public'
    and tablename <> '__drizzle_migrations'
  order by tablename
`);

const rows = Array.isArray(result) ? result : result.rows;
const tableNames = rows.map((row) => row.tablename);

if (tableNames.length === 0) {
  console.log("No application tables found to clean.");
  process.exit(0);
}

const tables = tableNames.map(quoteIdentifier).join(", ");

await database.execute(
  sql.raw(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`)
);

console.log(`Cleaned ${tableNames.length} table(s): ${tableNames.join(", ")}`);
