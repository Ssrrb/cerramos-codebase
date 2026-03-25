import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: [
      {
        find: /^@\/components\/(.*)$/,
        replacement: `${path.resolve(import.meta.dirname, "./app/components")}/$1`,
      },
      {
        find: /^@\/lib\/(.*)$/,
        replacement: `${path.resolve(import.meta.dirname, "./lib")}/$1`,
      },
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
