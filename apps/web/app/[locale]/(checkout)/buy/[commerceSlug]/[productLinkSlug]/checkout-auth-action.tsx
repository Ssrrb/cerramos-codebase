"use client";

import { signIn, signOut, signUp, useSession } from "@repo/auth/client";
import { buildAuthRedirectUrl } from "@repo/auth/utils";
import {
  AuthModal,
  SignInFormView,
  SignUpFormView,
} from "@repo/design-system/components/registration";
import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { ChevronDown, LogOut, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type AuthMode = "sign-in" | "sign-up";
type PendingAction = "email" | "google" | null;

const noop = () => undefined;

export interface CheckoutAuthUser {
  email: string;
  name?: string | null;
  phone?: string | null;
}

interface CheckoutAuthActionProps {
  googleEnabled?: boolean;
  initialUser?: CheckoutAuthUser | null;
  privacyUrl?: string;
  supportUrl?: string;
  termsUrl?: string;
}

const normalizeCheckoutAuthUser = (
  user:
    | {
        email?: string | null;
        name?: string | null;
      }
    | null
    | undefined
): CheckoutAuthUser | null => {
  if (!user?.email) {
    return null;
  }

  return {
    email: user.email,
    name: user.name ?? null,
  };
};

const CheckoutSignInContent = ({
  callbackUrl,
  googleEnabled,
  onAuthenticated,
  onSwitchToSignUp,
  privacyUrl,
  termsUrl,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
  onAuthenticated: () => void;
  onSwitchToSignUp: () => void;
  privacyUrl?: string;
  termsUrl?: string;
}) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();
  const isEmailPending = isPending && pendingAction === "email";
  const isGooglePending = isPending && pendingAction === "google";

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
        const { error: signInError } = await signIn.email({
          callbackURL: callbackUrl,
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message ?? "No se pudo iniciar sesion.");
          setPendingAction(null);
          return;
        }

        router.refresh();
        onAuthenticated();
        router.push(callbackUrl);
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
        const { error: signInError } = await signIn.social({
          callbackURL: callbackUrl,
          newUserCallbackURL: callbackUrl,
          provider: "google",
        });

        if (signInError) {
          setError(
            signInError.message ?? "No se pudo iniciar sesion con Google."
          );
          setPendingAction(null);
        }
      } catch {
        setError("No se pudo iniciar sesion con Google.");
        setPendingAction(null);
      }
    });
  };

  return (
    <SignInFormView
      callbackHref={buildAuthRedirectUrl("/sign-up", callbackUrl)}
      email={email}
      error={error}
      googleEnabled={googleEnabled}
      isEmailPending={isEmailPending}
      isGooglePending={isGooglePending}
      isPending={isPending}
      onEmailChange={setEmail}
      onGoogleClick={handleGoogle}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onSwitchToSignUp={onSwitchToSignUp}
      onUseDifferentEmail={() => setStep("email")}
      password={password}
      privacyUrl={privacyUrl}
      step={step}
      termsUrl={termsUrl}
    />
  );
};

const CheckoutSignUpContent = ({
  callbackUrl,
  googleEnabled,
  onAuthenticated,
  onSwitchToSignIn,
  privacyUrl,
  supportUrl,
  termsUrl,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
  onAuthenticated: () => void;
  onSwitchToSignIn: () => void;
  privacyUrl?: string;
  supportUrl?: string;
  termsUrl?: string;
}) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isPending, startTransition] = useTransition();
  const isEmailPending = isPending && pendingAction === "email";
  const isGooglePending = isPending && pendingAction === "google";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPendingAction("email");

    startTransition(async () => {
      try {
        const { error: signUpError } = await signUp.email({
          callbackURL: callbackUrl,
          email,
          name,
          password,
        });

        if (signUpError) {
          setError(signUpError.message ?? "No se pudo crear la cuenta.");
          setPendingAction(null);
          return;
        }

        router.refresh();
        onAuthenticated();
        router.push(callbackUrl);
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
        const { error: signUpError } = await signIn.social({
          callbackURL: callbackUrl,
          newUserCallbackURL: callbackUrl,
          provider: "google",
          requestSignUp: true,
        });

        if (signUpError) {
          setError(signUpError.message ?? "No se pudo continuar con Google.");
          setPendingAction(null);
        }
      } catch {
        setError("No se pudo continuar con Google.");
        setPendingAction(null);
      }
    });
  };

  return (
    <SignUpFormView
      accountHref={buildAuthRedirectUrl("/sign-in", callbackUrl)}
      email={email}
      error={error}
      googleEnabled={googleEnabled}
      isEmailPending={isEmailPending}
      isGooglePending={isGooglePending}
      isPending={isPending}
      name={name}
      onBack={onSwitchToSignIn}
      onEmailChange={setEmail}
      onGoogleClick={handleGoogle}
      onNameChange={setName}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onSwitchToSignIn={onSwitchToSignIn}
      onUsageChange={noop}
      password={password}
      privacyUrl={privacyUrl}
      step="account"
      supportUrl={supportUrl}
      termsUrl={termsUrl}
      usage="explore"
    />
  );
};

export const CheckoutAuthAction = ({
  googleEnabled = false,
  initialUser = null,
  privacyUrl,
  supportUrl,
  termsUrl,
}: CheckoutAuthActionProps) => {
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isSignOutPending, startSignOutTransition] = useTransition();
  const callbackUrl = pathname || "/";
  const locale =
    typeof params.locale === "string"
      ? params.locale
      : (pathname.split("/").filter(Boolean)[0] ?? "es");
  const accountOrdersHref = `/${locale}/account/ordenes`;
  const accountAddressesHref = `/${locale}/account/direcciones`;
  const sessionUser = normalizeCheckoutAuthUser(session?.user);
  const resolvedUser = isSessionPending ? initialUser : sessionUser;
  const resolvedUserEmail = resolvedUser?.email;

  useEffect(() => {
    if (resolvedUserEmail) {
      setIsOpen(false);
    }
  }, [resolvedUserEmail]);

  const handleClose = () => {
    setIsOpen(false);
    setMode("sign-in");
  };

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      await signOut();
      router.refresh();
    });
  };

  if (resolvedUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex max-w-[12rem] items-center gap-1 truncate text-muted-foreground text-xs"
            type="button"
          >
            <span className="truncate">
              {resolvedUser.name ?? resolvedUser.email}
            </span>
            <ChevronDown className="size-3 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="max-w-[12rem] truncate">
            {resolvedUser.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={accountOrdersHref}>
              <Package className="size-4" />
              Mis órdenes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={accountAddressesHref}>
              <MapPin className="size-4" />
              Mis direcciones
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isSignOutPending}
            onSelect={(event) => {
              event.preventDefault();
              handleSignOut();
            }}
          >
            <LogOut className="size-4" />
            {isSignOutPending ? "Cerrando..." : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        className="h-auto px-0 font-semibold text-inherit text-xs"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="link"
      >
        Ingresar
      </Button>
      <AuthModal
        description={
          mode === "sign-up"
            ? "Crea tu cuenta para guardar tus datos y volver mas rapido a futuros checkouts."
            : "Ingresa para reutilizar tus datos en este y futuros pedidos."
        }
        isOpen={isOpen}
        onClose={handleClose}
        title={mode === "sign-up" ? "Crear cuenta" : "Continuar con tu cuenta"}
        type={mode}
      >
        {mode === "sign-in" ? (
          <CheckoutSignInContent
            callbackUrl={callbackUrl}
            googleEnabled={googleEnabled}
            onAuthenticated={handleClose}
            onSwitchToSignUp={() => setMode("sign-up")}
            privacyUrl={privacyUrl}
            termsUrl={termsUrl}
          />
        ) : (
          <CheckoutSignUpContent
            callbackUrl={callbackUrl}
            googleEnabled={googleEnabled}
            onAuthenticated={handleClose}
            onSwitchToSignIn={() => setMode("sign-in")}
            privacyUrl={privacyUrl}
            supportUrl={supportUrl}
            termsUrl={termsUrl}
          />
        )}
      </AuthModal>
    </>
  );
};
