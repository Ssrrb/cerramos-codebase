"use client";

import { signIn } from "@repo/auth/client";
import {
  buildAuthRedirectUrl,
  DEFAULT_AUTH_AFTER_SIGN_IN_URL,
} from "@repo/auth/utils";
import { SignInFormView } from "@repo/design-system/components/registration";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SignInFormProps {
  callbackUrl?: string;
  googleEnabled?: boolean;
  privacyUrl?: string;
  termsUrl?: string;
}

export const SignInForm = ({
  callbackUrl = DEFAULT_AUTH_AFTER_SIGN_IN_URL,
  googleEnabled = false,
  privacyUrl,
  termsUrl,
}: SignInFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const isEmailPending = isPending && pendingAction === "email";
  const isGooglePending = isPending && pendingAction === "google";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (step === "email") {
      setStep("password");
      return;
    }

    setPendingAction("email");
    startTransition(async () => {
      try {
        const { data, error } = await signIn.email({
          callbackURL: callbackUrl,
          email,
          password,
        });

        if (error) {
          setError(error.message ?? "No se pudo iniciar sesion.");
          setPendingAction(null);
          return;
        }

        router.push(data?.url ?? callbackUrl);
        router.refresh();
      } catch {
        setError("No se pudo iniciar sesion. Intenta de nuevo.");
        setPendingAction(null);
      }
    });
  };

  const handleGoogle = () => {
    setError(null);
    setPendingAction("google");

    startTransition(async () => {
      try {
        const { error } = await signIn.social({
          callbackURL: callbackUrl,
          newUserCallbackURL: callbackUrl,
          provider: "google",
        });

        if (error) {
          setError(error.message ?? "No se pudo iniciar sesion con Google.");
          setPendingAction(null);
        }
      } catch {
        setError("No se pudo iniciar sesion con Google.");
        setPendingAction(null);
      }
    });
  };

  return (
    <SignInFormView
      callbackHref={buildAuthRedirectUrl("/sign-up", callbackUrl)}
      email={email}
      error={error}
      googleEnabled={googleEnabled}
      isEmailPending={isEmailPending}
      isGooglePending={isGooglePending}
      isPending={isPending}
      onEmailChange={setEmail}
      onGoogleClick={handleGoogle}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onUseDifferentEmail={() => setStep("email")}
      password={password}
      privacyUrl={privacyUrl}
      step={step}
      termsUrl={termsUrl}
    />
  );
};
