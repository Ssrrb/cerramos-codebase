"use client";

import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowRight } from "lucide-react";
import { AuthLegalLinks } from "../auth-legal-links";

const usageOptions = [
  {
    badge: "Pro",
    description: "Trabajo en proyectos comerciales",
    value: "business",
  },
  {
    badge: "Hobby",
    description: "Trabajo en proyectos personales",
    value: "explore",
  },
] as const;

export type UsageValue = (typeof usageOptions)[number]["value"];

export interface SignUpFormViewProps {
  accountHref: string;
  email: string;
  error?: string | null;
  googleEnabled?: boolean;
  isEmailPending?: boolean;
  isGooglePending?: boolean;
  isPending?: boolean;
  name: string;
  onBack: () => void;
  onEmailChange: (value: string) => void;
  onGoogleClick: () => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUsageChange: (value: UsageValue) => void;
  password: string;
  privacyUrl?: string;
  step: "setup" | "account";
  supportUrl?: string;
  termsUrl?: string;
  usage: UsageValue;
}

const inputClassName =
  "h-11 rounded-xl border-border bg-background px-3.5 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:border-foreground/20 focus-visible:ring-2 focus-visible:ring-foreground/10";

export const SignUpFormView = ({
  accountHref,
  email,
  error,
  googleEnabled = false,
  isEmailPending = false,
  isGooglePending = false,
  isPending = false,
  name,
  onBack,
  onEmailChange,
  onGoogleClick,
  onNameChange,
  onPasswordChange,
  onSubmit,
  onUsageChange,
  password,
  privacyUrl,
  step,
  supportUrl,
  termsUrl,
  usage,
}: SignUpFormViewProps) => {
  const isAccountStep = step === "account";

  return (
    <div className="mx-auto w-full max-w-[46rem]">
      <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-background shadow-[0_32px_90px_-56px_color-mix(in_oklab,var(--foreground)_45%,transparent)]">
        {isAccountStep ? (
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-[32.5rem]">
              <div className="space-y-2 text-center">
                <h1 className="font-semibold text-[2rem] text-foreground leading-tight tracking-[-0.05em] sm:text-[2.6rem]">
                  Create your account
                </h1>
                <p className="text-muted-foreground text-sm">
                  Finish your sign-up to continue into onboarding.
                </p>
              </div>

              <form className="mt-8 space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Tu nombre</Label>
                  <Input
                    autoComplete="name"
                    autoFocus
                    className={inputClassName}
                    id="name"
                    name="name"
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Sebastian"
                    required
                    type="text"
                    value={name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de trabajo</Label>
                  <Input
                    autoComplete="email"
                    className={inputClassName}
                    id="email"
                    name="email"
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="tu@comercio.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <Input
                    autoComplete="new-password"
                    className={inputClassName}
                    id="password"
                    minLength={8}
                    name="password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="Minimo 8 caracteres"
                    required
                    type="password"
                    value={password}
                  />
                </div>

                {error ? (
                  <Alert aria-live="polite" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {googleEnabled ? (
                  <Button
                    className="h-11 w-full rounded-xl border border-border bg-background font-medium text-foreground text-sm shadow-none hover:bg-muted/30"
                    disabled={isPending}
                    onClick={onGoogleClick}
                    type="button"
                    variant="ghost"
                  >
                    {isGooglePending
                      ? "Continuando con Google..."
                      : "Continuar con Google"}
                  </Button>
                ) : null}

                <Button
                  className="h-12 w-full rounded-xl bg-foreground font-medium text-background text-base shadow-none hover:bg-foreground/92"
                  disabled={isPending}
                  type="submit"
                >
                  {isEmailPending ? "Creating account..." : "Create Account"}
                </Button>

                <button
                  className="mx-auto inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onClick={onBack}
                  type="button"
                >
                  <ArrowRight className="size-3.5 rotate-180" />
                  Back
                </button>
              </form>

              <p className="mt-6 text-center text-muted-foreground text-sm">
                Already have an account?{" "}
                <a
                  className="font-medium text-foreground transition-colors hover:text-primary"
                  href={accountHref}
                >
                  Log In
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-[32.5rem]">
              <h1 className="text-center font-semibold text-[2.65rem] text-foreground leading-[1.02] tracking-[-0.07em] sm:text-[4rem]">
                Tu primera venta
                <br />
                está a solo un registro.
              </h1>

              <form className="mt-12 space-y-6" onSubmit={onSubmit}>
                <div className="space-y-3">
                  <Label className="font-medium text-muted-foreground text-sm">
                    Plan Type
                  </Label>
                  <div className="overflow-hidden rounded-xl border border-border/80">
                    {usageOptions.map((option, index) => (
                      <label
                        className={cn(
                          "flex cursor-pointer items-center gap-3 bg-background px-4 py-4 text-left transition-colors hover:bg-muted/30",
                          index === 0 ? "" : "border-border/80 border-t"
                        )}
                        key={option.value}
                      >
                        <input
                          checked={usage === option.value}
                          className="size-4 appearance-none rounded-full border border-input bg-background bg-clip-content p-[3px] align-middle shadow-xs transition-[border-color,background-color,box-shadow] checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          name="usage"
                          onChange={() => onUsageChange(option.value)}
                          type="radio"
                          value={option.value}
                        />
                        <span className="min-w-0 flex-1 text-[15px] text-foreground/85">
                          {option.description}
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 font-medium text-foreground/80 text-xs">
                          {option.badge}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="h-12 w-full rounded-xl bg-foreground font-medium text-background text-base shadow-none hover:bg-foreground/92"
                  disabled={isPending}
                  type="submit"
                >
                  Continue
                </Button>
              </form>

              <div className="mt-26 space-y-4 text-center">
                <p className="text-muted-foreground text-sm leading-6">
                  By joining, you agree to our Terms of Service and Privacy
                  Policy
                </p>
                <AuthLegalLinks privacyUrl={privacyUrl} termsUrl={termsUrl} />
              </div>
            </div>
          </div>
        )}

        <div className="border-[oklch(0.55_0.11_304_/_0.22)] border-t bg-[oklch(0.77_0.12_304_/_0.16)] px-6 py-4 sm:px-10 dark:bg-[oklch(0.34_0.08_304_/_0.48)]">
          {supportUrl ? (
            <a
              className="flex items-center justify-center gap-2 text-center text-[13px] text-[oklch(0.36_0.07_304)] transition-colors hover:text-[oklch(0.32_0.08_304)] dark:text-[oklch(0.83_0.05_304)] dark:hover:text-white"
              href={supportUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span>Have a complex company use case?</span>
              <span className="font-medium">
                Get Enterprise grade assistance
              </span>
              <ArrowRight className="size-3.5" />
            </a>
          ) : (
            <p className="text-center text-[13px] text-[oklch(0.36_0.07_304)] dark:text-[oklch(0.83_0.05_304)]">
              Have a complex company use case? Get Enterprise grade assistance
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
