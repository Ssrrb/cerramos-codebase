import { Toolbar as BaseHubToolbar } from "basehub/next-toolbar";
import { keys } from "../keys";

export const Toolbar = () =>
  keys().BASEHUB_TOKEN ? <BaseHubToolbar /> : null;
