"use client";

import { createAuthClient } from "better-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const client = createAuthClient();

export const { signIn, signOut, signUp, useSession } = client;

type SessionUser = {
  commerceId?: string | null;
  email: string;
  name?: string | null;
};

export const OrganizationSwitcher = ({
  afterSelectOrganizationUrl,
}: {
  afterSelectOrganizationUrl?: string;
  hidePersonal?: boolean;
}) => {
  const { data } = useSession();
  const user = data?.user as SessionUser | undefined;

  return (
    <Link
      className="flex h-9 w-full items-center rounded-md border px-3 text-sm"
      href={user?.commerceId ? afterSelectOrganizationUrl ?? "/" : "/onboarding"}
    >
      {user?.commerceId ? "Mi comercio" : "Configurar comercio"}
    </Link>
  );
};

export const UserButton = ({
  showName,
}: {
  appearance?: unknown;
  showName?: boolean;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data } = useSession();
  const user = data?.user as SessionUser | undefined;

  if (!user) {
    return (
      <Link className="flex h-9 w-full items-center rounded-md px-3 text-sm" href="/sign-in">
        {showName ? "Iniciar sesion" : "Cuenta"}
      </Link>
    );
  }

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm">
      <div className="min-w-0">
        <div className="truncate font-medium">
          {showName ? user.name ?? user.email : "Cuenta"}
        </div>
        {showName && (
          <div className="truncate text-muted-foreground text-xs">
            {user.email}
          </div>
        )}
      </div>
      <button
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-50"
        disabled={isPending}
        onClick={handleSignOut}
        type="button"
      >
        <span className="text-xs">Out</span>
        <span className="sr-only">Sign out</span>
      </button>
    </div>
  );
};
