"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

const NAV = [
  { href: "/boutique", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/infos", label: "Infos" },
];

export function SiteHeader() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-dulce-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="relative h-11 w-[7.5rem] shrink-0">
          <Image src="/logo.jpeg" alt="Dulce Store" fill sizes="120px" className="object-contain" priority />
        </Link>

        <form onSubmit={handleSearch} className="ml-2 hidden flex-1 max-w-xl md:block">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dulce-ink/40"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              placeholder="Rechercher un produit…"
              className="w-full rounded-lg border border-dulce-ink/15 bg-dulce-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-dulce-orange focus:bg-white focus:ring-4 focus:ring-dulce-orange/15"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-dulce-orange-light text-dulce-orange"
                    : "text-dulce-ink/70 hover:bg-dulce-surface hover:text-dulce-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/panier"
          className="focus-ring ml-auto flex items-center gap-2 rounded-lg bg-dulce-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dulce-orange-dark lg:ml-2"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Panier</span>
          {itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-dulce-orange">
              {itemCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="focus-ring rounded-md border border-dulce-ink/15 p-2.5 transition hover:border-dulce-orange lg:hidden"
        >
          {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      <nav
        className={`grid overflow-hidden border-dulce-border bg-white transition-all duration-300 lg:hidden ${
          open ? "grid-rows-[1fr] border-t opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 px-4 py-3">
          <form onSubmit={handleSearch} className="relative mb-2">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dulce-ink/40"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              placeholder="Rechercher un produit…"
              className="w-full rounded-lg border border-dulce-ink/15 bg-dulce-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-dulce-orange"
            />
          </form>
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-3.5 text-base font-semibold transition ${
                  active ? "text-dulce-orange" : "text-dulce-ink/80 hover:bg-dulce-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
