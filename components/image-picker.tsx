"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

/**
 * Sélecteur de photos qui redimensionne et recompresse dans le navigateur
 * avant l'envoi.
 *
 * Indispensable pour le back-office utilisé depuis un téléphone : une photo
 * d'iPhone pèse 2 à 5 Mo, or Next.js limite le corps d'une action serveur à
 * 1 Mo — le rejet a lieu dans le framework, avant le code applicatif, et se
 * manifeste par une page d'erreur opaque. Le passage par un canvas convertit
 * au passage le HEIC de l'iPhone en JPEG, et allège l'envoi en 4G.
 */

const MAX_DIMENSION = 1600;
const QUALITE = 0.85;

async function compresser(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const echelle = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITE),
  );
  if (!blob) throw new Error("Conversion de l'image impossible.");

  const nom = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${nom}.jpg`, { type: "image/jpeg" });
}

export function ImagePicker({ name = "imageFile" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<"vide" | "traitement" | "pret">("vide");
  const [resume, setResume] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const choisis = Array.from(e.target.files ?? []);
    if (choisis.length === 0) return;

    setEtat("traitement");
    setErreur(null);

    try {
      const avant = choisis.reduce((n, f) => n + f.size, 0);
      const compresses = await Promise.all(choisis.map(compresser));
      const apres = compresses.reduce((n, f) => n + f.size, 0);

      // On remplace le contenu de l'input par les versions allégées :
      // c'est ce que le formulaire enverra.
      const dt = new DataTransfer();
      for (const f of compresses) dt.items.add(f);
      inputRef.current!.files = dt.files;

      const mo = (n: number) => `${(n / 1024 / 1024).toFixed(1)} Mo`;
      setResume(
        `${compresses.length} photo${compresses.length > 1 ? "s" : ""} prête${
          compresses.length > 1 ? "s" : ""
        } — ${mo(avant)} réduit à ${mo(apres)}`,
      );
      setEtat("pret");
    } catch {
      setErreur("Impossible de préparer cette image. Essayez une autre photo.");
      setEtat("vide");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label" htmlFor={name}>
        Ajouter des photos
      </label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="field"
      />

      {etat === "traitement" && (
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-dulce-ink/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Préparation des photos…
        </p>
      )}

      {etat === "pret" && resume && (
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ImagePlus className="h-4 w-4 shrink-0" aria-hidden />
          {resume}
        </p>
      )}

      {erreur && <p className="mt-2 text-sm font-medium text-red-700">{erreur}</p>}

      <p className="mt-1 text-xs text-dulce-ink/50">
        Plusieurs photos possibles, directement depuis votre téléphone. Elles sont automatiquement
        allégées avant l&apos;envoi et s&apos;ajoutent à la galerie sans remplacer les existantes.
      </p>
    </div>
  );
}
