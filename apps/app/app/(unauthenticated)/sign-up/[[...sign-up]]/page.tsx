import { isGoogleAuthEnabled } from "@repo/auth/keys";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
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

const SignUpPage = () => (
  <SignUpForm
    googleEnabled={isGoogleAuthEnabled()}
    privacyUrl={privacyUrl}
    supportUrl={supportUrl}
    termsUrl={termsUrl}
  />
);

export default SignUpPage;
