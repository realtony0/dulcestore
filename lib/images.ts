/**
 * `next/image` ne se contente pas d'afficher une image cassée quand son `src`
 * est invalide : il lève une exception qui interrompt le rendu de toute la
 * page. Une seule fiche produit mal renseignée suffit donc à faire tomber la
 * boutique entière.
 *
 * Toute adresse venant de la base passe par ce filtre avant d'atteindre
 * `next/image`. Le formulaire du back-office valide déjà la saisie, mais les
 * fiches créées avant cette validation existent toujours.
 */
export function isDisplayableImage(url: string | null | undefined): url is string {
  if (!url) return false;
  const value = url.trim();
  if (!value) return false;
  if (value.startsWith("/")) return !value.includes(" ");
  return /^https?:\/\//.test(value);
}
