import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Stockage des photos produits sur Cloudflare R2 (API compatible S3).
 *
 * Le disque de Vercel est effacé à chaque redéploiement : une image écrite
 * dans public/ depuis le back-office disparaîtrait. R2 la conserve durablement.
 *
 * Variables attendues (dashboard Cloudflare → R2 → Manage API tokens) :
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 *   R2_PUBLIC_URL (domaine public du bucket, ex. https://images.dulce-store.com)
 *
 * Tant qu'elles ne sont pas renseignées, le back-office reste utilisable :
 * on colle simplement l'URL d'une image déjà en ligne.
 */

/**
 * Les valeurs sont nettoyées : un espace ou un retour à la ligne collé par
 * inadvertance dans le panneau d'environnement suffit à faire échouer la
 * signature S3 avec un message peu parlant ("signature does not match").
 */
function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function isR2Configured(): boolean {
  return [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_URL",
  ].every((n) => env(n).length > 0);
}

function client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Envoie un fichier sur R2 et retourne son URL publique. */
export async function uploadImage(file: File, prefix: string): Promise<string> {
  if (!isR2Configured()) throw new Error("Le stockage d'images R2 n'est pas configuré.");

  const ext = EXTENSIONS[file.type];
  if (!ext) throw new Error("Format d'image non supporté (JPEG, PNG, WebP ou AVIF attendu).");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image trop lourde (5 Mo maximum).");

  const key = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const body = new Uint8Array(await file.arrayBuffer());

  await client().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      Body: body,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${env("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
}

/** Supprime une image de R2. Sans effet sur les images servies depuis public/. */
export async function deleteImage(url: string): Promise<void> {
  if (!isR2Configured()) return;
  const base = env("R2_PUBLIC_URL").replace(/\/$/, "");
  if (!url.startsWith(base)) return;

  await client().send(
    new DeleteObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: url.slice(base.length + 1),
    }),
  );
}
