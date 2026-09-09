import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getShippingMethod, EUROPE_USA_STEPS, formatFCFA } from "@/lib/shipping";
import { PAYMENT_METHODS, SITE, whatsappLink } from "@/lib/site-config";
import { ClearCart } from "@/components/clear-cart";

export const metadata: Metadata = { title: "Commande confirmée" };

type Props = { searchParams: Promise<{ ref?: string; simule?: string; paiement?: string }> };

export default async function ConfirmationPage({ searchParams }: Props) {
  const { ref, simule, paiement } = await searchParams;
  const paiementIndisponible = paiement === "indisponible";
  if (!ref) notFound();

  const order = await prisma.order.findUnique({
    where: { reference: ref },
    include: { items: true },
  });
  if (!order) notFound();

  const shippingMethod = getShippingMethod(order.shippingMethod);
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
  const isInternational = order.destination === "EUROPE_USA";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ClearCart />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dulce-orange-light">
          <CheckCircle2 className="h-8 w-8 text-dulce-orange" aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Merci {order.customerName} !</h1>
        <p className="mt-3 text-dulce-ink/70">
          Votre commande est enregistrée sous la référence{" "}
          <strong className="text-dulce-ink">{order.reference}</strong>. Conservez-la pour toute
          question.
        </p>
      </div>

      {paiementIndisponible && (
        <div className="mt-8 rounded-2xl border-2 border-dulce-orange bg-dulce-orange-light p-5">
          <p className="font-bold">Le paiement en ligne est momentanément indisponible</p>
          <p className="mt-2 text-sm leading-relaxed text-dulce-ink/80">
            Votre commande <strong>{order.reference}</strong> est bien enregistrée et rien ne vous a
            été débité. Nous vous contactons sur WhatsApp au{" "}
            <strong>{order.customerPhone}</strong> pour convenir du règlement et vous communiquer
            les frais de livraison.
          </p>
          <a
            href={whatsappLink(
              `Bonjour ${SITE.name}, ma commande ${order.reference} n'a pas pu être payée en ligne.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary focus-ring mt-4 inline-flex"
          >
            Nous écrire maintenant
          </a>
        </div>
      )}

      {simule === "1" && (
        <div className="mt-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-sm">
          <p className="font-bold text-amber-900">Paiement simulé</p>
          <p className="mt-1 text-amber-900/80">
            Aucune clé d&apos;API de paiement n&apos;est encore configurée : la commande a bien été
            enregistrée, mais aucun montant n&apos;a été débité. Voir le README pour brancher{" "}
            {paymentMethod?.name ?? "le prestataire"}.
          </p>
        </div>
      )}

      {simule !== "1" && !paiementIndisponible && order.paymentStatus === "EN_ATTENTE" && (
        <div className="mt-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-sm">
          <p className="font-bold text-amber-900">Confirmation du paiement en cours</p>
          <p className="mt-1 text-amber-900/80">
            Votre commande est enregistrée. Nous attendons la confirmation de PayTech — cela prend
            généralement quelques secondes. Si ce message persiste après plusieurs minutes,
            contactez-nous sur WhatsApp avec votre référence de commande.
          </p>
        </div>
      )}

      {simule !== "1" && order.paymentStatus === "ECHEC" && (
        <div className="mt-8 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-sm">
          <p className="font-bold text-red-900">Paiement non abouti</p>
          <p className="mt-1 text-red-900/80">
            Le paiement de cette commande n&apos;a pas été confirmé. Vous pouvez réessayer depuis
            votre panier ou nous écrire sur WhatsApp.
          </p>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-dulce-ink/10 p-6">
        <h2 className="font-bold">Votre commande</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span>
                {item.label}
                <span className="text-dulce-ink/60"> × {item.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold">
                {formatFCFA(item.unitPriceFCFA * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-baseline justify-between border-t border-dulce-ink/10 pt-5">
          <span className="font-semibold">Total produits payé</span>
          <span className="text-2xl font-extrabold text-dulce-orange">
            {formatFCFA(order.productTotalFCFA)}
          </span>
        </div>
        <p className="mt-1 text-sm text-dulce-ink/60">
          Réglé par {paymentMethod?.name ?? order.paymentMethod} · Poids total estimé :{" "}
          {order.totalWeightKg.toFixed(2)} kg
        </p>
      </section>

      <section className="mt-6 rounded-2xl border-2 border-dulce-orange bg-dulce-orange-light p-6">
        <h2 className="font-bold">Frais de livraison — à régler à l&apos;arrivée</h2>
        <p className="mt-2 text-sm text-dulce-ink/80">
          Mode choisi : <strong>{shippingMethod?.name ?? order.shippingMethod}</strong>
          {shippingMethod?.rate &&
            ` — ${formatFCFA(shippingMethod.rate.amountFCFA)} / ${shippingMethod.rate.unit}`}
          {shippingMethod?.delay && ` · Délai estimatif : ${shippingMethod.delay}`}
        </p>
        <p className="mt-2 text-sm text-dulce-ink/80">
          Le montant définitif dépend du poids ou du volume réel de votre colis. Nous vous le
          communiquons par WhatsApp au <strong>{order.customerPhone}</strong>.
        </p>

        {isInternational && (
          <ol className="mt-4 space-y-2">
            {EUROPE_USA_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-dulce-ink/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink(
            `Bonjour ${SITE.name}, je viens de passer la commande ${order.reference}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Nous écrire sur WhatsApp
        </a>
        <Link href="/" className="btn-ghost">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
