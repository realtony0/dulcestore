"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Commandes" },
  { href: "/admin/catalogue", label: "Catalogue" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`focus-ring rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-dulce-orange-light text-dulce-orange"
                : "text-dulce-ink/60 hover:bg-dulce-surface hover:text-dulce-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
