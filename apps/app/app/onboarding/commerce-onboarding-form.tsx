"use client";

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
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-16">
      <div className="w-full rounded-3xl border border-border/70 bg-background p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Configuracion inicial</p>
          <h1 className="font-semibold text-3xl tracking-[-0.04em]">
            Crea tu comercio
          </h1>
          <p className="text-muted-foreground text-sm">
            {name?.trim() || email}, necesitamos el nombre de tu comercio para
            preparar tu panel autenticado.
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="businessName">
              Nombre del comercio
            </label>
            <input
              autoComplete="organization"
              className="flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm shadow-none outline-none transition focus-visible:border-foreground/20 focus-visible:ring-2 focus-visible:ring-foreground/10"
              id="businessName"
              name="businessName"
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Ej. Tienda Centro"
              required
              type="text"
              value={businessName}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 font-medium text-background text-sm disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Configurando..." : "Entrar al panel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommerceOnboardingForm;
