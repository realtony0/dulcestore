import Image from "next/image";
import Link from "next/link";
import { formatFCFA } from "@/lib/shipping";

type Props = {
  slug: string;
  name: string;
  tagline: string;
  imageUrl: string;
  priceFCFA: number;
  hasVariants: boolean;
  minOrderQty: number;
  categoryName?: string;
};

export function ProductCard({
  slug,
  name,
  tagline,
  imageUrl,
  priceFCFA,
  hasVariants,
  minOrderQty,
  categoryName,
}: Props) {
  return (
    <Link href={`/produit/${slug}`} className="card focus-ring group flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-dulce-cream">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-dulce-ink/40">
            Photo à venir
          </div>
        )}

        {minOrderQty > 1 && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-dulce-ink/70 shadow-soft backdrop-blur">
            Min. {minOrderQty}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        {categoryName && (
          <p className="truncate text-[0.65rem] font-bold uppercase tracking-wider text-dulce-orange">
            {categoryName}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug transition group-hover:text-dulce-orange">
          {name}
        </h3>

        <div className="mt-auto pt-3">
          {hasVariants && (
            <span className="block text-[0.65rem] font-semibold text-dulce-ink/50">à partir de</span>
          )}
          <p className="text-lg font-extrabold text-dulce-orange">{formatFCFA(priceFCFA)}</p>
        </div>
      </div>
    </Link>
  );
}
