import type { ReactNode } from "react";
import "./globals.css";
import { AuthChrome } from "./components/auth-chrome";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="auth-route relative min-h-dvh overflow-hidden bg-[oklch(0.989_0.002_286)] text-foreground antialiased dark:bg-[oklch(0.132_0.005_286)]">
    {/* Shared shell for sign-in/sign-up. These routes authenticate merchant users
        before handing them off to onboarding or the commerce dashboard. */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.76_0.02_270_/_0.12),transparent_36%),linear-gradient(180deg,transparent_0%,oklch(0.967_0.004_286)_100%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.72_0.02_280_/_0.1),transparent_28%),linear-gradient(180deg,transparent_0%,oklch(0.12_0.004_286)_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),oklch(0.87_0.003_286_/_0.35)_calc(100%-1px)),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),oklch(0.87_0.003_286_/_0.35)_calc(100%-1px))] bg-[size:32px_32px] opacity-40 dark:bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),oklch(0.36_0.004_286_/_0.3)_calc(100%-1px)),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),oklch(0.36_0.004_286_/_0.3)_calc(100%-1px))] dark:opacity-30" />
    <div className="relative flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-[72rem] px-4 sm:px-6">
        <AuthChrome />
      </div>
      <main className="mx-auto flex w-full max-w-[72rem] flex-1 items-center justify-center px-6 py-6 sm:px-8 sm:py-8">
        <div className="w-full">{children}</div>
      </main>
    </div>
  </div>
);

export default AuthLayout;
