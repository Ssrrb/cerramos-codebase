"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signUp } from "../client";

interface SignUpProps {
  googleEnabled?: boolean;
}

const planOptions = [
  {
    badge: "Pro",
    description: "I'm working on commercial projects",
    value: "business",
  },
  {
    badge: "Hobby",
    description: "I'm working on personal projects",
    value: "personal",
  },
] as const;

const inputClassName =
  "flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10";

export const SignUp = ({ googleEnabled: _googleEnabled = false }: SignUpProps) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<(typeof planOptions)[number]["value"]>(
    "business"
  );
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"setup" | "account">("setup");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (step === "setup") {
      setStep("account");
      return;
    }

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
        body: JSON.stringify({ commerceName: businessName, plan }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      if (!bootstrapResponse.ok) {
        const payload = (await bootstrapResponse.json().catch(() => null)) as {
          error?: string;
        } | null;

        setError(
          payload?.error ??
            "La cuenta se creo, pero no se pudo crear el comercio."
        );
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-[46rem] overflow-hidden rounded-[1.5rem] border border-border/80 bg-background shadow-[0_32px_90px_-56px_color-mix(in_oklab,var(--foreground)_45%,transparent)]">
      {step === "setup" ? (
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-[32.5rem]">
            <h1 className="text-center font-semibold text-[2.65rem] leading-[1.02] tracking-[-0.07em] text-foreground sm:text-[4rem]">
              Your first deploy
              <br />
              is just a sign-up away.
            </h1>

            <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm font-medium">
                  Plan Type
                </p>
                <div className="overflow-hidden rounded-xl border border-border/80">
                  {planOptions.map((option, index) => (
                    <label
                      className={`flex cursor-pointer items-center gap-3 bg-background px-4 py-4 text-left transition-colors hover:bg-muted/30 ${
                        index === 0 ? "" : "border-t border-border/80"
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={plan === option.value}
                        className="size-4"
                        name="plan"
                        onChange={() => setPlan(option.value)}
                        type="radio"
                        value={option.value}
                      />
                      <span className="min-w-0 flex-1 text-[15px] text-foreground/85">
                        {option.description}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80">
                        {option.badge}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-foreground px-4 text-base font-medium text-background transition-colors hover:bg-foreground/92 disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                Continue
              </button>
            </form>

            <p className="mt-24 text-center text-muted-foreground text-sm leading-6">
              By joining, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto max-w-[32.5rem]">
            <div className="space-y-2 text-center">
              <h1 className="font-semibold text-[2rem] leading-tight tracking-[-0.05em] text-foreground sm:text-[2.6rem]">
                Create your account
              </h1>
              <p className="text-muted-foreground text-sm">
                Finish your sign-up to start using Cerramos.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <input
                autoComplete="organization"
                className={inputClassName}
                name="businessName"
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Nombre del comercio"
                required
                type="text"
                value={businessName}
              />
              <input
                autoComplete="name"
                className={inputClassName}
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
                required
                type="text"
                value={name}
              />
              <input
                autoComplete="email"
                className={inputClassName}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@comercio.com"
                required
                type="email"
                value={email}
              />
              <input
                autoComplete="new-password"
                className={inputClassName}
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimo 8 caracteres"
                required
                type="password"
                value={password}
              />
              {error ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive text-sm">
                  {error}
                </p>
              ) : null}
              <button
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-foreground px-4 text-base font-medium text-background transition-colors hover:bg-foreground/92 disabled:opacity-50"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                onClick={() => setStep("setup")}
                type="button"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-[oklch(0.55_0.11_304_/_0.22)] bg-[oklch(0.77_0.12_304_/_0.16)] px-6 py-4 text-center dark:bg-[oklch(0.34_0.08_304_/_0.48)]">
        <Link
          className="text-[13px] text-[oklch(0.36_0.07_304)] transition-colors hover:text-[oklch(0.32_0.08_304)] dark:text-[oklch(0.83_0.05_304)] dark:hover:text-white"
          href="/sign-in"
        >
          Already have an account? Log In
        </Link>
      </div>
    </div>
  );
};
