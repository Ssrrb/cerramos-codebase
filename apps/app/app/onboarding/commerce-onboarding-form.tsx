"use client";

import { CommerceOnboardingFormView } from "@repo/design-system/components/registration";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface CommerceOnboardingFormProps {
  email: string;
  name?: string | null;
}

const CommerceOnboardingForm = ({
  email,
  name,
}: CommerceOnboardingFormProps) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/bootstrap", {
          body: JSON.stringify({ commerceName: businessName }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;

          setError(
            payload?.error ?? "No se pudo configurar tu comercio. Intenta de nuevo."
          );
          return;
        }

        router.push("/");
        router.refresh();
      } catch {
        setError("No se pudo configurar tu comercio. Intenta de nuevo.");
      }
    });
  };

  return (
    <CommerceOnboardingFormView
      businessName={businessName}
      email={email}
      error={error}
      isPending={isPending}
      name={name}
      onBusinessNameChange={setBusinessName}
      onSubmit={handleSubmit}
    />
  );
};

export default CommerceOnboardingForm;
