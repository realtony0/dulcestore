import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Protection de /admin par un simple mot de passe (ADMIN_PASSWORD).
 * Le cookie ne contient pas le mot de passe mais un HMAC calculé avec lui :
 * sans connaître ADMIN_PASSWORD, impossible de forger un cookie valide.
 * Suffisant pour une page consultée par une seule personne ; à remplacer par
 * une vraie authentification si plusieurs comptes deviennent nécessaires.
 */

const COOKIE_NAME = "dulce_admin";

function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length > 0 ? p : null;
}

function expectedToken(password: string): string {
  return createHmac("sha256", password).update("dulce-admin-v1").digest("hex");
}

/** Comparaison à temps constant, pour ne pas fuiter le mot de passe. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate: string): string | null {
  const password = adminPassword();
  if (!password) return null;
  return safeEqual(candidate, password) ? expectedToken(password) : null;
}

export async function isAuthenticated(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return !!token && safeEqual(token, expectedToken(password));
}

/** true quand ADMIN_PASSWORD n'est pas configuré : l'accès reste alors fermé. */
export function isAdminConfigured(): boolean {
  return adminPassword() !== null;
}

export const ADMIN_COOKIE = COOKIE_NAME;
