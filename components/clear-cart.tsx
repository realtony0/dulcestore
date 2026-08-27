"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Vide le panier une fois la commande enregistrée en base. */
export function ClearCart() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
    // `clear` est stable pour un panier donné ; on ne veut vider qu'une fois.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return null;
}
