import Link from "next/link";
import type { SidebarGroup } from "@/lib/docs";

type DocsMobileNavProps = {
  groups: SidebarGroup[];
};

export function DocsMobileNav({ groups }: DocsMobileNavProps) {
  return (
    <details className="rounded-3xl border border-line bg-surface p-4 shadow-soft md:hidden">
      <summary className="cursor-pointer list-none text-sm font-semibold tracking-[0.02em]">
        Navegar documentación
      </summary>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-line bg-surface-strong px-3 py-3"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
