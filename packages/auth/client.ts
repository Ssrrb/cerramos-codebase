"use client";

export const OrganizationSwitcher = ({
  afterSelectOrganizationUrl,
}: {
  afterSelectOrganizationUrl?: string;
  hidePersonal?: boolean;
}) => (
  <a
    className="flex h-9 w-full items-center rounded-md border px-3 text-sm"
    href={afterSelectOrganizationUrl ?? "/"}
  >
    Comercio actual
  </a>
);

export const UserButton = ({
  showName,
}: {
  appearance?: unknown;
  showName?: boolean;
}) => (
  <a
    className="flex h-9 w-full items-center rounded-md px-3 text-sm"
    href="/sign-in"
  >
    {showName ? "Iniciar sesion" : "Cuenta"}
  </a>
);
