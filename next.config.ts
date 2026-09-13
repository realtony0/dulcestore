import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Les photos sont déjà compressées dans le navigateur (ImagePicker), mais
    // la limite par défaut de 1 Mo est trop basse pour un envoi multiple :
    // le dépassement est rejeté par le framework, avant le code applicatif,
    // et se manifeste par une page d'erreur opaque.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
