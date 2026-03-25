"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "../client";

interface SignInProps {
  googleEnabled?: boolean;
}

export const SignIn = ({ googleEnabled = false }: SignInProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const { data, error } = await signIn.email({
        callbackURL: "/",
        email,
        password,
      });

      if (error) {
        setError(error.message ?? "No se pudo iniciar sesion.");
        return;
      }

      router.push(data?.url ?? "/");
      router.refresh();
    });
  };

  const handleGoogle = () => {
    startTransition(async () => {
      const { error } = await signIn.social({
        callbackURL: "/",
        newUserCallbackURL: "/onboarding",
        provider: "google",
      });

      if (error) {
        setError(error.message ?? "No se pudo iniciar sesion con Google.");
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Iniciar sesion</h1>
        <p className="text-muted-foreground text-sm">
          {googleEnabled
            ? "Accede con email y contrasena o continua con Google."
            : "Accede con email y contrasena."}
        </p>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contrasena"
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
          {isPending ? "Ingresando..." : "Ingresar"}
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
      <Link className="text-sm underline" href="/sign-up">
        Crear cuenta
      </Link>
    </div>
  );
};
