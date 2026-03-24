import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const schemaPath = path.join(packageRoot, "prisma", "schema.prisma");
const configPath = path.join(packageRoot, "prisma.config.ts");
const generatedDir = path.join(packageRoot, "generated");
const lockDir = path.join(packageRoot, ".cache", "prisma-generate.lock");
const stampFile = path.join(generatedDir, ".generate-stamp");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function getStamp() {
  const [schema, config] = await Promise.all([
    readFile(schemaPath, "utf8"),
    readFile(configPath, "utf8"),
  ]);

  return createHash("sha256")
    .update(schema)
    .update("\n---\n")
    .update(config)
    .digest("hex");
}

async function runPrismaGenerate() {
  const command = path.join(
    packageRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );
  const child = spawn(command, ["generate", "--no-hints", "--schema=./prisma/schema.prisma"], {
    cwd: packageRoot,
    stdio: "inherit",
    shell: false,
  });

  await new Promise((resolve, reject) => {
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          signal
            ? `prisma generate terminated by signal ${signal}`
            : `prisma generate exited with code ${code ?? "unknown"}`
        )
      );
    });
    child.on("error", reject);
  });
}

async function acquireLock() {
  await mkdir(path.dirname(lockDir), { recursive: true });

  while (true) {
    try {
      await mkdir(lockDir, { recursive: false });
      return;
    } catch (error) {
      if (error && error.code === "EEXIST") {
        await sleep(150);
        continue;
      }

      throw error;
    }
  }
}

async function main() {
  const nextStamp = await getStamp();

  await acquireLock();

  try {
    const hasStamp = await exists(stampFile);
    const [currentStamp, hasClient] = await Promise.all([
      hasStamp ? readFile(stampFile, "utf8") : Promise.resolve(""),
      exists(path.join(generatedDir, "client.ts")),
    ]);

    if (hasClient && currentStamp.trim() === nextStamp) {
      return;
    }

    await runPrismaGenerate();
    await writeFile(stampFile, `${nextStamp}\n`);
  } finally {
    await rm(lockDir, { recursive: true, force: true });
  }
}

await main();
