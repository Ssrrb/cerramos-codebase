"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarGroup } from "@/lib/docs";

type DocsSidebarProps = {
  groups: SidebarGroup[];
};

export function DocsSidebar({ groups }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-muted">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border px-3 py-3 transition-colors ${
                    active
                      ? "border-accent bg-accent-soft shadow-[0_10px_30px_rgba(91,53,24,0.08)]"
                      : "border-transparent hover:border-line hover:bg-surface-strong"
                  }`}
                >
                  <p className="text-sm font-semibold tracking-[-0.02em]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
