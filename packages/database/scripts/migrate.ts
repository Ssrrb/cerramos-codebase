import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(dirname, "..", ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle commands.");
}

const migrationDir = path.join(dirname, "..", "drizzle");
const migrationFiles = Array.from(new Bun.Glob("*.sql").scanSync(migrationDir))
  .sort()
  .map((name) => path.join(migrationDir, name));

type Diagnostic = {
  dbHashes: string[];
  localHashes: string[];
  publicTables: string[];
};

const commandExists = (command: string) => {
  const result = Bun.spawnSync(["which", command], {
    stdout: "ignore",
    stderr: "ignore",
  });

  return result.exitCode === 0;
};

const runPsql = (sql: string) => {
  const result = Bun.spawnSync(
    ["psql", databaseUrl, "-Atq", "-v", "ON_ERROR_STOP=1", "-c", sql],
    {
      stdout: "pipe",
      stderr: "pipe",
      env: process.env,
    }
  );

  return {
    exitCode: result.exitCode,
    stdout: new TextDecoder().decode(result.stdout).trim(),
    stderr: new TextDecoder().decode(result.stderr).trim(),
  };
};

const getDiagnostics = async (): Promise<Diagnostic | null> => {
  if (!commandExists("psql")) {
    return null;
  }

  const localHashes = await Promise.all(
    migrationFiles.map(async (file) =>
      createHash("sha256")
        .update(await Bun.file(file).text())
        .digest("hex")
    )
  );

  const migrationQuery = runPsql(
    'select hash from drizzle."__drizzle_migrations" order by created_at, id;'
  );

  if (migrationQuery.exitCode !== 0) {
    return {
      dbHashes: [],
      localHashes,
      publicTables: [],
    };
  }

  const tablesQuery = runPsql(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name;"
  );

  return {
    dbHashes: migrationQuery.stdout
      ? migrationQuery.stdout.split("\n").filter(Boolean)
      : [],
    localHashes,
    publicTables: tablesQuery.stdout
      ? tablesQuery.stdout.split("\n").filter(Boolean)
      : [],
  };
};

const formatTableList = (tables: string[]) =>
  tables.length > 0 ? tables.join(", ") : "(none)";

const failDrift = (message: string, diagnostic: Diagnostic) => {
  console.error("Database migration drift detected.");
  console.error(message);
  console.error("");
  console.error(`Local migration files: ${diagnostic.localHashes.length}`);
  console.error(`Recorded DB migrations: ${diagnostic.dbHashes.length}`);
  console.error(`Public tables: ${formatTableList(diagnostic.publicTables)}`);
  console.error("");
  console.error(
    "This database cannot be migrated in place until its schema and drizzle.__drizzle_migrations history are repaired or the database is reset."
  );
  process.exit(1);
};

const diagnostic = await getDiagnostics();

if (diagnostic) {
  if (diagnostic.dbHashes.length > diagnostic.localHashes.length) {
    failDrift(
      "The database has more recorded migrations than exist in the repo. Migration history was rewritten.",
      diagnostic
    );
  }

  const mismatchIndex = diagnostic.dbHashes.findIndex(
    (hash, index) => diagnostic.localHashes[index] !== hash
  );

  if (mismatchIndex !== -1) {
    const dbHash = diagnostic.dbHashes[mismatchIndex];
    const localHash = diagnostic.localHashes[mismatchIndex] ?? "(missing)";

    failDrift(
      `First migration hash mismatch at position ${mismatchIndex + 1}: database has ${dbHash}, repo has ${localHash}.`,
      diagnostic
    );
  }

  const hasAppliedBaseMigrations = diagnostic.dbHashes.length >= 5;
  const hasProductLinkTable = diagnostic.publicTables.includes("ProductLink");

  if (hasAppliedBaseMigrations && !hasProductLinkTable) {
    failDrift(
      'The database is missing public."ProductLink" even though earlier migrations are recorded as applied.',
      diagnostic
    );
  }
}

const migrate = Bun.spawn(
  ["bun", "run", "drizzle-kit", "migrate", "--config=drizzle.config.ts"],
  {
    cwd: path.join(dirname, ".."),
    env: process.env,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }
);

const exitCode = await migrate.exited;

process.exit(exitCode);
