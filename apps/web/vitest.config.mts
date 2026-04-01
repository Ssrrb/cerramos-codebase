import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
  },
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${path.resolve(import.meta.dirname, "./")}/$1`,
      },
      {
        find: "@repo",
        replacement: path.resolve(import.meta.dirname, "../../packages"),
      },
    ],
  },
});
