import { VercelToolbar } from "@vercel/toolbar/next";
import { keys } from "../keys";

const isToolbarEnabled = () =>
  Boolean(keys().FLAGS_SECRET && process.env.VERCEL);

export const Toolbar = () => (isToolbarEnabled() ? <VercelToolbar /> : null);
