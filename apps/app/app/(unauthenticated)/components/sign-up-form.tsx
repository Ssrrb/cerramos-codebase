"use client";

import { signIn, signUp } from "@repo/auth/client";
import {
  buildAuthRedirectUrl,
  DEFAULT_AUTH_AFTER_SIGN_IN_URL,
} from "@repo/auth/utils";
import {
  SignUpFormView,
  type UsageValue,
} from "@repo/design-system/components/registration";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface SignUpFormProps {
  callbackUrl?: string;
  googleEnabled?: boolean;
  privacyUrl?: string;
  supportUrl?: string;
  termsUrl?: string;
}

export const SignUpForm = ({
  callbackUrl = DEFAULT_AUTH_AFTER_SIGN_IN_URL,
  googleEnabled = false,
  privacyUrl,
  supportUrl,
  termsUrl,
}: SignUpFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"setup" | "account">("setup");
  const [usage, setUsage] = useState<UsageValue>("business");
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (step === "setup") {
      setStep("account");
      return;
    }

    setPendingAction("email");
    startTransition(async () => {
      try {
        const { error } = await signUp.email({
          callbackURL: callbackUrl,
          email,
          name,
          password,
        });

        if (error) {
          setError(error.message ?? "No se pudo crear la cuenta.");
          setPendingAction(null);
          return;
        }

        // Onboarding will later expand into business verification and
        // email-confirmation steps, so account creation intentionally stops here.
        router.push("/onboarding");
        router.refresh();
      } catch {
        setError("No se pudo crear la cuenta. Intenta de nuevo.");
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
          newUserCallbackURL: "/onboarding",
          provider: "google",
          requestSignUp: true,
        });

        if (error) {
          setError(error.message ?? "No se pudo continuar con Google.");
          setPendingAction(null);
        }
      } catch {
        setError("No se pudo continuar con Google.");
        setPendingAction(null);
      }
    });
  };

  const isEmailPending = isPending && pendingAction === "email";
  const isGooglePending = isPending && pendingAction === "google";

  return (
    <SignUpFormView
      accountHref={buildAuthRedirectUrl("/sign-in", callbackUrl)}
      email={email}
      error={error}
      googleEnabled={googleEnabled}
      isEmailPending={isEmailPending}
      isGooglePending={isGooglePending}
      isPending={isPending}
      name={name}
      onBack={() => setStep("setup")}
      onEmailChange={setEmail}
      onGoogleClick={handleGoogle}
      onNameChange={setName}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onUsageChange={setUsage}
      password={password}
      privacyUrl={privacyUrl}
      step={step}
      supportUrl={supportUrl}
      termsUrl={termsUrl}
      usage={usage}
    />
  );
};
