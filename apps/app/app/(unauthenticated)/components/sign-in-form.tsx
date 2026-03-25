"use client";

import { signIn } from "@repo/auth/client";
import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronLeft, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthLegalLinks } from "./auth-legal-links";

interface SignInFormProps {
  googleEnabled?: boolean;
  privacyUrl?: string;
  termsUrl?: string;
}

const GoogleIcon = () => (
  <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
    <path
      d="M21.805 10.023H12v3.955h5.608c-.242 1.27-.967 2.346-2.064 3.068v2.545h3.338c1.954-1.8 3.078-4.45 3.078-7.591 0-.664-.06-1.301-.155-1.977Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.79 0 5.133-.924 6.844-2.51l-3.338-2.545c-.924.62-2.108.997-3.506.997-2.688 0-4.968-1.813-5.785-4.256H2.768v2.624A10.332 10.332 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.215 13.686A6.198 6.198 0 0 1 5.89 11.7c0-.689.118-1.356.326-1.987V7.089H2.768A10.332 10.332 0 0 0 1.67 11.7c0 1.654.397 3.22 1.099 4.611l3.446-2.625Z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.457c1.518 0 2.883.523 3.96 1.55l2.96-2.96C17.128 2.371 14.785 1.4 12 1.4 7.958 1.4 4.422 3.726 2.768 7.09l3.447 2.624C7.032 7.27 9.312 5.457 12 5.457Z"
      fill="#EA4335"
    />
  </svg>
);

const panelButtonClass =
  "h-11 rounded-xl border border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out hover:border-foreground/25 hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[oklch(0.16_0.004_286)] dark:hover:bg-[oklch(0.19_0.004_286)]";

export const SignInForm = ({
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
          callbackURL: "/",
          email,
          password,
        });

        if (error) {
          setError(error.message ?? "No se pudo iniciar sesion.");
          setPendingAction(null);
          return;
        }

        router.push(data?.url ?? "/");
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
          callbackURL: "/",
          newUserCallbackURL: "/onboarding",
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

  const isEmailPending = isPending && pendingAction === "email";
  const isGooglePending = isPending && pendingAction === "google";
  const isPasswordStep = step === "password";

  return (
    <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-semibold text-3xl tracking-[-0.05em] text-foreground sm:text-[2.15rem]">
            Log in to Cerramos
          </h1>
          <p className="mx-auto max-w-[20rem] text-muted-foreground text-sm leading-6">
            Entra a tu panel para ordenar pedidos, cobros y seguimiento en un
            solo flujo.
          </p>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <Input
              autoComplete="email"
              autoFocus
              className={cn(
                "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                "placeholder:text-muted-foreground/80",
                "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15",
                isPasswordStep ? "pr-20" : ""
              )}
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              required
              type="email"
              value={email}
            />
            {isPasswordStep ? (
              <div className="relative">
                <Input
                  autoComplete="current-password"
                  className={cn(
                    "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                    "placeholder:text-muted-foreground/80",
                    "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                  )}
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                />
                <button
                  className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground text-xs transition-colors hover:text-foreground"
                  onClick={() => setStep("email")}
                  type="button"
                >
                  <ChevronLeft className="mr-1 size-3.5" />
                  Edit
                </button>
              </div>
            ) : null}
          </div>
          {error ? (
            <Alert aria-live="polite" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            className={cn(
              "h-11 w-full rounded-xl border px-4 text-[15px] font-medium shadow-sm transition-all duration-200 ease-out",
              "border-black/5 bg-foreground text-background hover:bg-foreground/92",
              "dark:border-white/5 dark:bg-[oklch(0.95_0.002_286)] dark:text-[oklch(0.16_0.004_286)] dark:hover:bg-white"
            )}
            disabled={isPending}
            type="submit"
          >
            {isEmailPending
              ? "Signing in..."
              : isPasswordStep
                ? "Log In"
                : "Continue with Email"}
          </Button>
        </form>
        <div className="space-y-3">
          {googleEnabled ? (
            <>
              <div className="flex items-center gap-3 py-1">
                <Separator className="flex-1 bg-border/60" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/75">
                  or
                </span>
                <Separator className="flex-1 bg-border/60" />
              </div>
              <Button
                className={cn(panelButtonClass, "w-full justify-center")}
                disabled={isPending}
                onClick={handleGoogle}
                type="button"
                variant="ghost"
              >
                <GoogleIcon />
                {isGooglePending
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </Button>
            </>
          ) : null}
          <div className="pt-2 text-center">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                className="font-medium text-foreground transition-colors hover:text-primary"
                href="/sign-up"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-14 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 text-[11px] text-muted-foreground/85 shadow-sm backdrop-blur-sm dark:bg-[oklch(0.16_0.004_286)]">
          <Mail className="size-3.5" />
          Acceso para operaciones y seguimiento del negocio.
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 text-[11px] text-muted-foreground/85 shadow-sm backdrop-blur-sm dark:bg-[oklch(0.16_0.004_286)]">
          <LockKeyhole className="size-3.5" />
          Sesion protegida para tu panel interno.
        </div>
        <div className="pt-4">
          <AuthLegalLinks privacyUrl={privacyUrl} termsUrl={termsUrl} />
        </div>
      </div>
    </div>
  );
};
