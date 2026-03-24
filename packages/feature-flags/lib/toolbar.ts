import { existsSync } from "node:fs";
import { join } from "node:path";
import { withVercelToolbar } from "@vercel/toolbar/plugins/next";
import { keys } from "../keys";

const hasVercelLink = () =>
  existsSync(join(process.cwd(), ".vercel", "project.json"));

export const isToolbarEnabled = () => {
  if (!keys().FLAGS_SECRET) {
    return false;
  }

  if (process.env.NODE_ENV === "development") {
    return hasVercelLink();
  }

  return Boolean(process.env.VERCEL);
};

export const withToolbar = (config: object) =>
  isToolbarEnabled() ? withVercelToolbar()(config) : config;
