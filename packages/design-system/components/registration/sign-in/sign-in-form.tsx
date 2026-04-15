"use client";

import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronLeft, Mail } from "lucide-react";
import { AuthLegalLinks } from "../auth-legal-links";

export interface SignInFormViewProps {
  callbackHref: string;
  email: string;
  error?: string | null;
  googleEnabled?: boolean;
  isEmailPending?: boolean;
  isGooglePending?: boolean;
  isPending?: boolean;
  onEmailChange: (value: string) => void;
  onGoogleClick: () => void;
  onPasswordChange: (value: string) => void;
  onSwitchToSignUp?: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUseDifferentEmail: () => void;
  password: string;
  privacyUrl?: string;
  step: "email" | "password";
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

export const SignInFormView = ({
  callbackHref,
  email,
  error,
  googleEnabled = false,
  isEmailPending = false,
  isGooglePending = false,
  isPending = false,
  onEmailChange,
  onGoogleClick,
  onPasswordChange,
  onSwitchToSignUp,
  onSubmit,
  onUseDifferentEmail,
  password,
  privacyUrl,
  step,
  termsUrl,
}: SignInFormViewProps) => {
  const isPasswordStep = step === "password";

  let submitLabel = "Continue with Email";

  if (isEmailPending) {
    submitLabel = "Signing in...";
  } else if (isPasswordStep) {
    submitLabel = "Log In";
  }

  return (
    <div className="mx-auto flex w-full max-w-[22rem] flex-col items-center">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-semibold text-3xl text-foreground tracking-[-0.05em] sm:text-[2.15rem]">
            Log in to Cheki
          </h1>
          <p className="mx-auto max-w-[20rem] text-muted-foreground text-sm leading-6">
            Ordena pedidos, servicios y seguimiento en un solo flujo.
          </p>
        </div>
        <form className="space-y-3" onSubmit={onSubmit}>
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
              onChange={(event) => onEmailChange(event.target.value)}
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
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="Password"
                  required
                  type="password"
                  value={password}
                />
                <button
                  className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground text-xs transition-colors hover:text-foreground"
                  onClick={onUseDifferentEmail}
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
              "h-11 w-full rounded-xl border px-4 font-medium text-[15px] shadow-sm transition-all duration-200 ease-out",
              "border-black/5 bg-foreground text-background hover:bg-foreground/92",
              "dark:border-white/5 dark:bg-[oklch(0.95_0.002_286)] dark:text-[oklch(0.16_0.004_286)] dark:hover:bg-white"
            )}
            disabled={isPending}
            type="submit"
          >
            {submitLabel}
          </Button>
        </form>
        <div className="space-y-3">
          {googleEnabled ? (
            <>
              <div className="flex items-center gap-3 py-1">
                <Separator className="flex-1 bg-border/60" />
                <span className="text-[11px] text-muted-foreground/75 uppercase tracking-[0.2em]">
                  or
                </span>
                <Separator className="flex-1 bg-border/60" />
              </div>
              <Button
                className={cn(panelButtonClass, "w-full justify-center")}
                disabled={isPending}
                onClick={onGoogleClick}
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
              {onSwitchToSignUp ? (
                <button
                  className="font-medium text-foreground transition-colors hover:text-primary"
                  onClick={onSwitchToSignUp}
                  type="button"
                >
                  Sign Up
                </button>
              ) : (
                <a
                  className="font-medium text-foreground transition-colors hover:text-primary"
                  href={callbackHref}
                >
                  Sign Up
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-14 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 text-[11px] text-muted-foreground/85 shadow-sm backdrop-blur-sm dark:bg-[oklch(0.16_0.004_286)]">
          <Mail className="size-3.5" />
          Guarda tus datos para futuras compras.
        </div>
        <div className="pt-4">
          <AuthLegalLinks privacyUrl={privacyUrl} termsUrl={termsUrl} />
        </div>
      </div>
    </div>
  );
};
//TODO: add google option for users icon to the auth modal
