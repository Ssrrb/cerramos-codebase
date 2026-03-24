"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, Logo } from "@/geistdocs";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(255,253,248,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-4 md:px-6">
        <Link href="/docs" className="shrink-0">
          <Logo />
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-accent-soft hover:text-accent-strong"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
