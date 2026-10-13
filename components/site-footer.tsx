import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SITE, PAYMENT_METHODS, whatsappLink } from "@/lib/site-config";
import { PaymentIcon } from "@/components/icons";

const LEGAL_LINKS = [
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
];

const CATEGORIES = [
  { href: "/boutique?categorie=cuisine-pro", label: "Cuisine Pro" },
  { href: "/boutique?categorie=packaging", label: "Packaging" },
  { href: "/boutique?categorie=accessoires", label: "Accessoires" },
  { href: "/boutique?categorie=beaute", label: "Beauté" },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-dulce-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="relative h-10 w-32 rounded-lg bg-white/95">
            <Image src="/logo.jpeg" alt="Dulce Store" fill sizes="128px" className="object-contain p-1.5" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/55">{SITE.slogan}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map((p) => (
              <PaymentIcon key={p.id} method={p.icon} className="h-4" />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Boutique</p>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="transition hover:text-dulce-orange">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Aide</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/infos" className="transition hover:text-dulce-orange">
                Infos pratiques
              </Link>
            </li>
            <li>
              <Link href="/a-propos" className="transition hover:text-dulce-orange">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-dulce-orange">
                Contact
              </Link>
            </li>
            <li>
              <a
                href={whatsappLink("Bonjour Dulce Store, j'ai une question.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-dulce-orange"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-xs text-white/40 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-white/70">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
