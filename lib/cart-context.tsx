"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  /** productSlug + variantId, unique par ligne de panier. */
  key: string;
  productSlug: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  unitPriceFCFA: number;
  unitWeightKg: number;
  imageUrl: string;
  minOrderQty: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  totalFCFA: number;
  totalWeightKg: number;
  itemCount: number;
  ready: boolean;
};

const STORAGE_KEY = "dulce-store-panier";

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productSlug: string, variantId: string | null) {
  return variantId ? `${productSlug}::${variantId}` : productSlug;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setLines(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (line) => {
      const key = lineKey(line.productSlug, line.variantId);
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l));
        }
        return [...prev, { ...line, key }];
      });
    };

    const setQuantity: CartContextValue["setQuantity"] = (key, quantity) => {
      setLines((prev) =>
        prev.map((l) => (l.key === key ? { ...l, quantity: Math.max(l.minOrderQty, quantity) } : l)),
      );
    };

    return {
      lines,
      add,
      setQuantity,
      remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines([]),
      totalFCFA: lines.reduce((sum, l) => sum + l.unitPriceFCFA * l.quantity, 0),
      totalWeightKg: lines.reduce((sum, l) => sum + l.unitWeightKg * l.quantity, 0),
      itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
      ready,
    };
  }, [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
