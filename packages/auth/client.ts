"use client";

import { createElement } from "react";

export const OrganizationSwitcher = ({
  afterSelectOrganizationUrl,
}: {
  afterSelectOrganizationUrl?: string;
  hidePersonal?: boolean;
}) =>
  createElement(
    "a",
    {
      className: "flex h-9 w-full items-center rounded-md border px-3 text-sm",
      href: afterSelectOrganizationUrl ?? "/",
    },
    "Comercio actual"
  );

export const UserButton = ({
  showName,
}: {
  appearance?: unknown;
  showName?: boolean;
}) =>
  createElement(
    "a",
    {
      className: "flex h-9 w-full items-center rounded-md px-3 text-sm",
      href: "/sign-in",
    },
    showName ? "Iniciar sesion" : "Cuenta"
  );
