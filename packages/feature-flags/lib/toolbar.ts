import { withVercelToolbar } from "@vercel/toolbar/plugins/next";
import { keys } from "../keys";

const isToolbarEnabled = () =>
  Boolean(keys().FLAGS_SECRET && process.env.VERCEL);

export const withToolbar = (config: object) =>
  isToolbarEnabled() ? withVercelToolbar()(config) : config;
