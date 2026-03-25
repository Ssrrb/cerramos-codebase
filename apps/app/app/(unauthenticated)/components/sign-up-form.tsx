"use client";

import { signIn, signUp } from "@repo/auth/client";
import {
  Alert,
  AlertDescription,
} from "@repo/design-system/components/ui/alert";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/design-system/components/ui/radio-group";
import { Separator } from "@repo/design-system/components/ui/separator";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowRight, BriefcaseBusiness, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthLegalLinks } from "./auth-legal-links";

interface SignUpFormProps {
  googleEnabled?: boolean;
  privacyUrl?: string;
  supportUrl?: string;
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

const usageOptions = [
  {
    description: "Voy a ordenar ventas y seguimiento para un negocio real.",
    icon: BriefcaseBusiness,
    value: "business",
    badge: "Core",
    title: "Uso para mi negocio",
  },
  {
    description: "Quiero probar el flujo antes de incorporarlo al equipo.",
    icon: Compass,
    value: "explore",
    badge: "Test",
    title: "Estoy explorando Cerramos",
  },
] as const;

type UsageValue = (typeof usageOptions)[number]["value"];

const panelButtonClass =
  "h-11 rounded-xl border border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out hover:border-foreground/25 hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[oklch(0.16_0.004_286)] dark:hover:bg-[oklch(0.19_0.004_286)]";

export const SignUpForm = ({
  googleEnabled = false,
  privacyUrl,
  supportUrl,
  termsUrl,
}: SignUpFormProps) => {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
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
          callbackURL: "/",
          email,
          name,
          password,
        });

        if (error) {
          setError(error.message ?? "No se pudo crear la cuenta.");
          setPendingAction(null);
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
          const payload = (await bootstrapResponse
            .json()
            .catch(() => null)) as { error?: string } | null;

          setError(
            payload?.error ??
              "La cuenta se creo, pero no se pudo crear el comercio."
          );
          setPendingAction(null);
          return;
        }

        router.push("/");
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
          callbackURL: "/",
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
  const isAccountStep = step === "account";
  const selectedUsage = usageOptions.find((option) => option.value === usage);

  return (
    <div className="mx-auto w-full max-w-[31rem]">
      <div className="overflow-hidden rounded-[1.65rem] border border-border/70 bg-background/80 shadow-[0_24px_80px_-40px_rgba(15,15,15,0.28)] backdrop-blur-md dark:bg-[oklch(0.145_0.004_286_/_0.9)]">
        <div className="border-b border-border/60 px-5 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[22rem] space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                First workspace
              </Badge>
              {selectedUsage ? (
                <Badge
                  className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
                  variant="outline"
                >
                  {selectedUsage.badge}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="font-semibold text-[2rem] leading-[1.05] tracking-[-0.06em] text-foreground">
                Your first organized sale is one sign-up away.
              </h1>
              <p className="text-muted-foreground text-sm leading-6">
                Crea el espacio desde donde tu negocio va a ordenar pedidos,
                cobros y seguimiento sin depender del chat.
              </p>
            </div>
            {googleEnabled ? (
              <div className="space-y-3 pt-1">
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
                <div className="flex items-center gap-3">
                  <Separator className="flex-1 bg-border/60" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/75">
                    or create with email
                  </span>
                  <Separator className="flex-1 bg-border/60" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <div className="mx-auto max-w-[22rem] space-y-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isAccountStep ? (
                <>
                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-sm font-medium">
                      Uso de Cerramos
                    </Label>
                    <RadioGroup
                      className="gap-2.5"
                      onValueChange={(value) => setUsage(value as UsageValue)}
                      value={usage}
                    >
                      {usageOptions.map((option) => (
                        <label
                          className={cn(
                            "group flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-out",
                            usage === option.value
                              ? "border-foreground/25 bg-foreground/[0.04] shadow-sm dark:border-white/25 dark:bg-white/[0.05]"
                              : "border-border/70 bg-background/60 hover:border-foreground/15 hover:bg-background/90 dark:bg-[oklch(0.16_0.004_286)]"
                          )}
                          key={option.value}
                        >
                          <RadioGroupItem
                            className="mt-0.5"
                            value={option.value}
                          />
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <option.icon className="size-4 text-muted-foreground group-data-[state=checked]:text-foreground" />
                                <span className="font-medium text-sm text-foreground">
                                  {option.title}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-sm leading-5">
                                {option.description}
                              </p>
                            </div>
                            <span className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              {option.badge}
                            </span>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre del comercio</Label>
                    <Input
                      autoComplete="organization"
                      autoFocus
                      className={cn(
                        "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                        "placeholder:text-muted-foreground/80",
                        "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                      )}
                      id="businessName"
                      name="businessName"
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder="Ej. Tienda Centro"
                      required
                      type="text"
                      value={businessName}
                    />
                    <p className="text-muted-foreground text-xs leading-5">
                      Lo usaremos para crear tu primer espacio de trabajo en
                      Cerramos.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3 text-sm shadow-sm dark:bg-[oklch(0.16_0.004_286)]">
                    <p className="font-medium text-foreground">
                      {selectedUsage?.title}
                    </p>
                    <p className="mt-1 text-muted-foreground leading-5">
                      {selectedUsage?.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre del comercio</Label>
                    <Input
                      autoComplete="organization"
                      className={cn(
                        "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                        "placeholder:text-muted-foreground/80",
                        "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                      )}
                      id="businessName"
                      name="businessName"
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder="Ej. Tienda Centro"
                      required
                      type="text"
                      value={businessName}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Tu nombre</Label>
                    <Input
                      autoComplete="name"
                      autoFocus
                      className={cn(
                        "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                        "placeholder:text-muted-foreground/80",
                        "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                      )}
                      id="name"
                      name="name"
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Como te conocen en el negocio"
                      required
                      type="text"
                      value={name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de trabajo</Label>
                    <Input
                      autoComplete="email"
                      className={cn(
                        "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                        "placeholder:text-muted-foreground/80",
                        "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                      )}
                      id="email"
                      name="email"
                      onChange={(event) => setEmail(event.target.value)}
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
                      className={cn(
                        "h-11 rounded-xl border-border/70 bg-background/70 px-4 text-[15px] shadow-sm transition-all duration-200 ease-out dark:bg-[oklch(0.16_0.004_286)]",
                        "placeholder:text-muted-foreground/80",
                        "focus-visible:border-foreground/25 focus-visible:ring-1 focus-visible:ring-foreground/15"
                      )}
                      id="password"
                      minLength={8}
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimo 8 caracteres"
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                </>
              )}
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
                  ? "Creating account..."
                  : isAccountStep
                    ? "Create Account"
                    : "Continue"}
              </Button>
              {isAccountStep ? (
                <button
                  className="mx-auto flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onClick={() => setStep("setup")}
                  type="button"
                >
                  <ArrowRight className="size-3.5 rotate-180" />
                  Volver a la selección inicial
                </button>
              ) : null}
            </form>
            <div className="space-y-4 pt-2 text-center">
              <p className="text-muted-foreground text-sm leading-6">
                By joining, you agree to our Terms of Service and Privacy
                Policy.
              </p>
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link
                  className="font-medium text-foreground transition-colors hover:text-primary"
                  href="/sign-in"
                >
                  Log In
                </Link>
              </p>
              <AuthLegalLinks privacyUrl={privacyUrl} termsUrl={termsUrl} />
            </div>
          </div>
        </div>
        <div className="border-t border-[oklch(0.55_0.11_304_/_0.22)] bg-[oklch(0.77_0.12_304_/_0.16)] px-5 py-4 dark:bg-[oklch(0.34_0.08_304_/_0.48)] sm:px-7">
          {supportUrl ? (
            <Link
              className="flex items-center justify-center gap-2 text-center text-[13px] text-[oklch(0.36_0.07_304)] transition-colors hover:text-[oklch(0.32_0.08_304)] dark:text-[oklch(0.83_0.05_304)] dark:hover:text-white"
              href={supportUrl}
              rel="noreferrer"
              target="_blank"
            >
              <span>¿Tu operación necesita una configuración guiada?</span>
              <span className="font-medium">Hablar con el equipo</span>
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <p className="text-center text-[13px] text-[oklch(0.36_0.07_304)] dark:text-[oklch(0.83_0.05_304)]">
              ¿Tu operación necesita una configuración guiada? Hablar con el
              equipo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
