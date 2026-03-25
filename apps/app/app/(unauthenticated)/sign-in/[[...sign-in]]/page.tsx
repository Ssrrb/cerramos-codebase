import { isGoogleAuthEnabled } from "@repo/auth/keys";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
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

const SignInPage = () => (
  <SignInForm
    googleEnabled={isGoogleAuthEnabled()}
    privacyUrl={privacyUrl}
    termsUrl={termsUrl}
  />
);

export default SignInPage;
