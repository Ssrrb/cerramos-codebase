"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn, signUp } from "../client";

interface SignUpProps {
  googleEnabled?: boolean;
}

export const SignUp = ({ googleEnabled = false }: SignUpProps) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { error } = await signUp.email({
        callbackURL: "/",
        email,
        name,
        password,
      });

      if (error) {
        setError(error.message ?? "No se pudo crear la cuenta.");
        return;
      }

      const bootstrapResponse = await fetch("/api/auth/bootstrap", {
        body: JSON.stringify({ commerceName: businessName }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!bootstrapResponse.ok) {
        const payload = (await bootstrapResponse.json().catch(() => null)) as
          | { error?: string }
          | null;

        setError(
          payload?.error ?? "La cuenta se creo, pero no se pudo crear el comercio."
        );
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  const handleGoogle = () => {
    startTransition(async () => {
      const { error } = await signIn.social({
        callbackURL: "/",
        newUserCallbackURL: "/onboarding",
        provider: "google",
        requestSignUp: true,
      });

      if (error) {
        setError(error.message ?? "No se pudo continuar con Google.");
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Crea tu usuario y el primer comercio que vas a administrar.
        </p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          name="businessName"
          onChange={(event) => setBusinessName(event.target.value)}
          placeholder="Nombre del comercio"
          required
          type="text"
          value={businessName}
        />
        <input
          autoComplete="name"
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
          required
          type="text"
          value={name}
        />
        <input
          autoComplete="email"
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@comercio.com"
          required
          type="email"
          value={email}
        />
        <input
          autoComplete="new-password"
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimo 8 caracteres"
          required
          type="password"
          value={password}
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
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      {googleEnabled ? (
        <button
          className="inline-flex h-10 w-full items-center justify-center rounded-md border px-4 text-sm disabled:opacity-50"
          disabled={isPending}
          onClick={handleGoogle}
          type="button"
        >
          Continuar con Google
        </button>
      ) : null}
      <Link className="text-sm underline" href="/sign-in">
        Ya tengo cuenta
      </Link>
    </div>
  );
};
