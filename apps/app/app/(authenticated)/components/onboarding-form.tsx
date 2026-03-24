"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export const OnboardingForm = () => {
  const router = useRouter();
  const [commerceName, setCommerceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/bootstrap", {
        body: JSON.stringify({ commerceName }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setError(payload?.error ?? "No se pudo configurar tu comercio.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Configura tu comercio</h1>
        <p className="text-sm text-muted-foreground">
          Necesitamos un nombre para activar tu espacio de trabajo.
        </p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          name="commerceName"
          onChange={(event) => setCommerceName(event.target.value)}
          placeholder="Nombre del comercio"
          required
          type="text"
          value={commerceName}
        />
        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-destructive text-sm">
            {error}
          </p>
        )}
        <button
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-primary-foreground text-sm disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creando..." : "Crear comercio"}
        </button>
      </form>
    </div>
  );
};
