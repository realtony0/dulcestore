import Image from "next/image";
import { Plane, Ship, Globe2 } from "lucide-react";
import type { PaymentMethodId } from "@/lib/site-config";
import type { ShippingMethodId } from "@/lib/shipping";

/**
 * Logos officiels des moyens de paiement, dans public/paiement/ :
 *   wave.png          — wave.com
 *   orange-money.svg  — Wikimedia Commons (marque Orange Money)
 *   visa.svg          — Wikimedia Commons (marque Visa 2021→)
 *   mastercard.svg    — Wikimedia Commons (marque Mastercard)
 *   paypal.png        — paypalobjects.com (CDN officiel PayPal)
 * La carte bancaire affiche les deux réseaux acceptés côte à côte.
 */
const PAYMENT_LOGOS: Record<PaymentMethodId, { src: string; w: number; h: number; alt: string }[]> = {
  WAVE: [{ src: "/paiement/wave.png", w: 230, h: 101, alt: "Wave" }],
  ORANGE_MONEY: [{ src: "/paiement/orange-money.svg", w: 431, h: 115, alt: "Orange Money" }],
  CARTE: [
    { src: "/paiement/visa.svg", w: 1000, h: 325, alt: "Visa" },
    { src: "/paiement/mastercard.svg", w: 132, h: 103, alt: "Mastercard" },
  ],
  PAYPAL: [{ src: "/paiement/paypal.png", w: 200, h: 51, alt: "PayPal" }],
};

export function PaymentIcon({
  method,
  className = "h-5",
}: {
  method: PaymentMethodId;
  className?: string;
}) {
  const logos = PAYMENT_LOGOS[method];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {logos.map((logo) => (
        <span
          key={logo.src}
          className="inline-flex items-center justify-center rounded bg-white px-1.5 py-1 ring-1 ring-dulce-ink/10"
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={logo.w}
            height={logo.h}
            className={`w-auto ${className}`}
          />
        </span>
      ))}
    </span>
  );
}

const SHIPPING_ICON: Record<ShippingMethodId, typeof Plane> = {
  FRET_EXPRESS: Plane,
  FRET: Plane,
  CARGO_MARITIME: Ship,
  FRET_INTERNATIONAL: Globe2,
};

export function ShippingIcon({ id, className = "h-4 w-4" }: { id: ShippingMethodId; className?: string }) {
  const Icon = SHIPPING_ICON[id];
  return <Icon className={className} aria-hidden />;
}
