import type { ReactNode } from "react";
import { AuthChrome } from "./components/auth-chrome";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="relative min-h-dvh overflow-hidden bg-[oklch(0.989_0.002_286)] text-foreground dark:bg-[oklch(0.132_0.005_286)]">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.76_0.02_270_/_0.12),transparent_36%),linear-gradient(180deg,transparent_0%,oklch(0.967_0.004_286)_100%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.72_0.02_280_/_0.1),transparent_28%),linear-gradient(180deg,transparent_0%,oklch(0.12_0.004_286)_100%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),oklch(0.87_0.003_286_/_0.35)_calc(100%-1px)),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),oklch(0.87_0.003_286_/_0.35)_calc(100%-1px))] bg-[size:32px_32px] opacity-40 dark:bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),oklch(0.36_0.004_286_/_0.3)_calc(100%-1px)),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),oklch(0.36_0.004_286_/_0.3)_calc(100%-1px))] dark:opacity-30" />
    <div className="relative flex min-h-dvh flex-col">
      <AuthChrome />
      <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-10 sm:px-6 sm:pb-12">
        {children}
      </main>
    </div>
  </div>
);

export default AuthLayout;
