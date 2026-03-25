import { isGoogleAuthEnabled } from "@repo/auth/keys";
import { getSession } from "@repo/auth/server";
import {
  DEFAULT_AUTH_AFTER_SIGN_IN_URL,
  normalizeReturnTo,
} from "@repo/auth/utils";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "../../components/sign-in-form";

const title = "Iniciar sesion";
const description = "Accede a tu panel de Cerramos y retoma tus pedidos.";
export const metadata: Metadata = createMetadata({ title, description });

const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
const privacyUrl = webUrl
  ? new URL("/legal/privacy", webUrl).toString()
  : undefined;
const termsUrl = webUrl
  ? new URL("/legal/terms", webUrl).toString()
  : undefined;

interface SignInPageProps {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const resolvedSearchParams = await searchParams;
  const callbackUrl =
    normalizeReturnTo(resolvedSearchParams?.returnTo) ??
    DEFAULT_AUTH_AFTER_SIGN_IN_URL;
  const session = await getSession();

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <SignInForm
      callbackUrl={callbackUrl}
      googleEnabled={isGoogleAuthEnabled()}
      privacyUrl={privacyUrl}
      termsUrl={termsUrl}
    />
  );
};

export default SignInPage;
