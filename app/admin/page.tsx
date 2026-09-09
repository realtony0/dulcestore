import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getShippingMethod, formatFCFA } from "@/lib/shipping";
import { PAYMENT_METHODS } from "@/lib/site-config";

export const metadata: Metadata = { title: "Commandes", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";


const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  EN_ATTENTE: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  PAYE: { label: "Payé", cls: "bg-emerald-100 text-emerald-800" },
  ECHEC: { label: "Échec", cls: "bg-red-100 text-red-800" },
  REMBOURSE: { label: "Remboursé", cls: "bg-slate-200 text-slate-700" },
};

export default async function AdminPage() {

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const paid = orders.filter((o) => o.paymentStatus === "PAYE");
  const revenue = paid.reduce((n, o) => n + o.productTotalFCFA, 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Commandes</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">Total</p>
          <p className="mt-1 text-2xl font-extrabold">{orders.length}</p>
        </div>
        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">Payées</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{paid.length}</p>
        </div>
        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">
            Encaissé (produits)
          </p>
          <p className="mt-1 text-2xl font-extrabold text-dulce-orange">{formatFCFA(revenue)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dulce-border bg-white p-8 text-center text-dulce-ink/60">
          Aucune commande pour le moment.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = STATUS_STYLE[order.paymentStatus] ?? {
              label: order.paymentStatus,
              cls: "bg-slate-200 text-slate-700",
            };
            const shipping = getShippingMethod(order.shippingMethod);
            const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
            const phone = order.customerPhone.replace(/[^\d]/g, "");

            return (
              <article
                key={order.id}
                className="rounded-lg border border-dulce-border bg-white p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-lg font-extrabold">{order.reference}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-dulce-ink/55">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(order.createdAt)}
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-dulce-orange">
                    {formatFCFA(order.productTotalFCFA)}
                  </p>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">
                      Client
                    </p>
                    <p className="mt-1.5 font-semibold">{order.customerName}</p>
                    <p className="text-sm text-dulce-ink/70">{order.customerPhone}</p>
                    {order.customerEmail && (
                      <p className="text-sm text-dulce-ink/70">{order.customerEmail}</p>
                    )}
                    <p className="mt-1 text-sm text-dulce-ink/70">
                      {order.customerCity}
                      {order.customerAddress && ` — ${order.customerAddress}`}
                    </p>
                    <a
                      href={`https://wa.me/${phone}?text=${encodeURIComponent(
                        `Bonjour ${order.customerName}, au sujet de votre commande ${order.reference} chez Dulce Store.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring mt-3 inline-flex items-center gap-2 rounded-lg bg-dulce-orange px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-dulce-orange-dark"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Contacter sur WhatsApp
                    </a>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">
                      Livraison et paiement
                    </p>
                    <p className="mt-1.5 text-sm">
                      <span className="font-semibold">{shipping?.name ?? order.shippingMethod}</span>
                      {shipping?.rate &&
                        ` — ${formatFCFA(shipping.rate.amountFCFA)}/${shipping.rate.unit}`}
                    </p>
                    <p className="text-sm text-dulce-ink/70">
                      Destination : {order.destination === "SENEGAL" ? "Sénégal" : "Europe / USA"}
                    </p>
                    <p className="text-sm text-dulce-ink/70">
                      Poids estimé : <strong>{order.totalWeightKg.toFixed(2)} kg</strong>
                    </p>
                    <p className="text-sm text-dulce-ink/70">
                      Réglé par {payment?.name ?? order.paymentMethod}
                    </p>
                    {order.providerRef && (
                      <p className="mt-1 font-mono text-xs text-dulce-ink/45">
                        PayTech : {order.providerRef}
                      </p>
                    )}
                  </div>
                </div>

                <ul className="mt-5 divide-y divide-dulce-border border-t border-dulce-border pt-3">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span>
                        {item.label}
                        <span className="text-dulce-ink/55"> × {item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-semibold">
                        {formatFCFA(item.unitPriceFCFA * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
