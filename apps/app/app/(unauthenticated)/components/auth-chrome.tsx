"use client";

import { AuthChrome as AuthChromeView } from "@repo/design-system/components/registration";
import { usePathname } from "next/navigation";

const authNavigation = {
  "/sign-in": {
    ctaHref: "/sign-up",
    ctaLabel: "Sign Up",
  },
  "/sign-up": {
    ctaHref: "/sign-in",
    ctaLabel: "Log In",
  },
} as const;

export const AuthChrome = () => {
  const pathname = usePathname();
  const navigation =
    authNavigation[pathname as keyof typeof authNavigation] ??
    authNavigation["/sign-in"];
  return (
    <AuthChromeView
      ctaHref={navigation.ctaHref}
      ctaLabel={navigation.ctaLabel}
    />
  );
};
