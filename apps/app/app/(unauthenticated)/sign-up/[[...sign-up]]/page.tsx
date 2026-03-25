import { isGoogleAuthEnabled } from "@repo/auth/keys";
import { getSession } from "@repo/auth/server";
import {
  DEFAULT_AUTH_AFTER_SIGN_IN_URL,
  normalizeReturnTo,
} from "@repo/auth/utils";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "../../components/sign-up-form";

const title = "Crear cuenta";
const description =
  "Crea tu acceso y deja listo tu primer comercio en Cerramos.";
export const metadata: Metadata = createMetadata({ title, description });

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
const privacyUrl = webUrl
  ? new URL("/legal/privacy", webUrl).toString()
  : undefined;
const supportUrl = webUrl ? new URL("/contact", webUrl).toString() : undefined;
const termsUrl = webUrl
  ? new URL("/legal/terms", webUrl).toString()
  : undefined;

interface SignUpPageProps {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
}

const SignUpPage = async ({ searchParams }: SignUpPageProps) => {
  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    normalizeReturnTo(resolvedSearchParams?.returnTo) ??
    DEFAULT_AUTH_AFTER_SIGN_IN_URL;
  const session = await getSession();

  // If the user is already authenticated, skip the sign-up surface and send them
  // back to their requested internal dashboard path.
  if (session) {
    redirect(callbackUrl);
  }

  return (
    <SignUpForm
      callbackUrl={callbackUrl}
      googleEnabled={isGoogleAuthEnabled()}
      privacyUrl={privacyUrl}
      supportUrl={supportUrl}
      termsUrl={termsUrl}
    />
  );
};

export default SignUpPage;
