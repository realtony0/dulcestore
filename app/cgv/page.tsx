import type { Metadata } from "next";
import Link from "next/link";
import { SITE, LEGAL, PAYMENT_METHODS, whatsappLink } from "@/lib/site-config";
import { SHIPPING_METHODS, formatFCFA } from "@/lib/shipping";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Prix, paiement, frais de livraison réglés à l'arrivée, droit de rétractation et remboursement chez Dulce Store.",
};

const vendeur = LEGAL.raisonSociale.trim() || SITE.name;

export default function CgvPage() {
  const senegal = SHIPPING_METHODS.filter((m) => m.destination === "SENEGAL");

  return (
    <LegalLayout
      title="Conditions générales de vente"
      intro="Ce que vous payez, quand, et ce qui se passe si quelque chose ne va pas."
    >
      <LegalSection title="1. Objet et acceptation">
        <p>
          Les présentes conditions régissent les ventes conclues sur {SITE.domain} entre{" "}
          <strong>{vendeur}</strong>, qui exploite la boutique {SITE.name} (« le Vendeur »), et
          toute personne passant commande (« le Client »). Valider une commande vaut acceptation
          pleine et entière des présentes conditions, dans leur version en ligne au jour de la
          commande.
        </p>
      </LegalSection>

      <LegalSection title="2. Produits">
        <p>
          {SITE.name} commercialise des produits importés de Chine : mode, accessoires, matériel
          de cuisine professionnelle, beauté et packaging.
        </p>
        <p>
          Les photographies, dimensions, poids et coloris affichés proviennent de nos
          fournisseurs et sont fournis à titre indicatif. De légères variations entre le produit
          livré et son illustration ne constituent pas un défaut de conformité.
        </p>
        <p>
          Certains articles, notamment en packaging, sont soumis à une{" "}
          <strong>quantité minimale de commande</strong> indiquée sur leur fiche produit. Cette
          quantité ne peut pas être fractionnée.
        </p>
      </LegalSection>

      <LegalSection title="3. Prix des produits">
        <p>
          Les prix sont affichés en francs CFA (FCFA). Le prix applicable est celui affiché sur la
          fiche produit au moment de la validation de la commande.
        </p>
        <p>
          {SITE.name} se réserve le droit de modifier ses prix à tout moment ; les commandes déjà
          validées et payées ne sont pas affectées.
        </p>
      </LegalSection>

      <LegalSection title="4. Frais de livraison — réglés séparément, à l'arrivée">
        <div className="rounded-lg border-2 border-dulce-orange bg-dulce-orange-light p-5">
          <p className="font-bold text-dulce-ink">
            Le montant payé en ligne couvre uniquement le prix des produits.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-dulce-ink/80">
            Les frais de transport ne sont <strong>pas</strong> inclus. Ils sont calculés
            séparément et réglés <strong>à l&apos;arrivée du colis</strong>.
          </p>
        </div>
        <p>
          Les frais dépendent du mode d&apos;acheminement choisi et du poids ou du volume
          <strong> réellement constatés</strong> après pesée ou mesure du colis. Les tarifs en
          vigueur pour le Sénégal sont les suivants :
        </p>
        <dl className="divide-y divide-dulce-ink/10 overflow-hidden rounded-lg border border-dulce-border">
          {senegal.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 text-sm odd:bg-dulce-cream/50"
            >
              <dt>
                <span className="font-semibold">{m.name}</span>
                {m.delay && <span className="block text-dulce-ink/60">Délai estimatif : {m.delay}</span>}
              </dt>
              <dd className="shrink-0 font-bold text-dulce-orange">
                {formatFCFA(m.rate!.amountFCFA)} / {m.rate!.unit}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          Les estimations de frais affichées sur le site, calculées à partir des poids indicatifs
          des fiches produits, n&apos;ont aucune valeur contractuelle. Le montant définitif est
          communiqué au Client par WhatsApp avant la remise du colis.
        </p>
        <p>
          Pour l&apos;Europe et les États-Unis, seul le fret international est proposé. Son tarif
          dépend du colis et fait l&apos;objet d&apos;un devis communiqué par WhatsApp après
          validation de la commande.
        </p>
      </LegalSection>

      <LegalSection title="5. Commande">
        <p>
          Le Client sélectionne ses produits, renseigne ses coordonnées — dont un numéro WhatsApp
          valide, indispensable au suivi —, choisit sa destination, son mode d&apos;acheminement
          et son moyen de paiement, puis valide sa commande.
        </p>
        <p>
          La commande est enregistrée sous une référence au format DS-XXXXXX, que le Client est
          invité à conserver. La vente est définitivement conclue à la confirmation du paiement.
        </p>
        <p>
          {SITE.name} se réserve le droit de refuser ou d&apos;annuler une commande en cas de
          litige antérieur, de coordonnées manifestement erronées, de rupture
          d&apos;approvisionnement ou d&apos;erreur manifeste de prix. Le Client est alors
          intégralement remboursé.
        </p>
      </LegalSection>

      <LegalSection title="6. Paiement">
        <p>
          Le prix des produits est payé en ligne au moment de la commande, par{" "}
          {PAYMENT_METHODS.map((m) => m.name).join(", ")}.
        </p>
        <p>
          Les paiements sont traités par un prestataire agréé. {SITE.name} n&apos;a accès à aucune
          donnée bancaire du Client : coordonnées de carte et identifiants de compte mobile sont
          saisis sur l&apos;interface sécurisée du prestataire.
        </p>
        <p>
          La commande n&apos;est traitée qu&apos;après confirmation effective du paiement par le
          prestataire.
        </p>
      </LegalSection>

      <LegalSection title="7. Livraison">
        <p>
          Les délais annoncés courent à compter de la confirmation du paiement et de la
          disponibilité des produits chez le fournisseur. Ce sont des{" "}
          <strong>estimations</strong> : le transport international et les formalités douanières
          peuvent les allonger.
        </p>
        <p>
          {SITE.name} informe le Client par WhatsApp de l&apos;avancement de son colis et de sa
          mise à disposition. Les droits et taxes éventuellement exigibles à l&apos;importation
          restent à la charge du Client lorsqu&apos;ils ne sont pas inclus dans les frais
          annoncés.
        </p>
      </LegalSection>

      <LegalSection title="8. Droit de rétractation">
        <p>
          Conformément au décret n° 2008-718 du 30 juin 2008 pris pour l&apos;application de la
          loi n° 2008-08 sur les transactions électroniques, le Client dispose d&apos;un délai de{" "}
          <strong>sept (7) jours ouvrables</strong> pour se rétracter,{" "}
          <strong>sans avoir à se justifier et sans pénalité</strong>.
        </p>
        <p>
          Ce délai court à compter de la réception des produits. Pour exercer ce droit, le Client
          nous écrit à {SITE.email} ou sur WhatsApp, en indiquant sa référence de commande.
        </p>
        <p>
          Les produits doivent être retournés complets, dans leur emballage d&apos;origine et dans
          un état permettant leur revente. Les frais de retour sont à la charge du Client, sauf
          lorsque la rétractation fait suite à une erreur de notre part ou à un produit non
          conforme.
        </p>
      </LegalSection>

      <LegalSection title="9. Remboursement">
        <p>
          En cas de rétractation valablement exercée, de commande annulée par {SITE.name} ou de
          produit non conforme, le Client est remboursé du{" "}
          <strong>prix des produits qu&apos;il a payé en ligne</strong>, par le même moyen de
          paiement que celui utilisé lors de la commande, dans un délai maximum de{" "}
          <strong>quatorze (14) jours</strong> à compter de la réception du produit retourné ou de
          l&apos;accord sur l&apos;annulation.
        </p>
        <p>
          Les frais de livraison déjà engagés auprès du transporteur ne sont pas remboursables
          lorsque le colis a déjà été acheminé, sauf si le retour résulte d&apos;une erreur de
          notre part.
        </p>
        <p>
          Si le Client ne réclame pas son colis ou refuse de régler les frais de livraison dus à
          l&apos;arrivée, {SITE.name} lui rembourse le prix des produits, déduction faite des
          frais de transport réellement engagés pour acheminer la commande.
        </p>
      </LegalSection>

      <LegalSection title="10. Produits endommagés ou non conformes">
        <p>
          Le Client est invité à vérifier l&apos;état de son colis à la réception. Tout produit
          manquant, endommagé ou non conforme à la commande doit nous être signalé{" "}
          <strong>dans les 48 heures</strong> suivant la réception, photographies à l&apos;appui,
          par WhatsApp ou à {SITE.email}.
        </p>
        <p>
          Après vérification, le produit est remplacé ou remboursé, sans frais supplémentaires
          pour le Client.
        </p>
      </LegalSection>

      <LegalSection title="11. Service client et réclamations">
        <p>
          Pour toute question ou réclamation, {SITE.name} est joignable par WhatsApp au{" "}
          <a
            href={whatsappLink(`Bonjour ${SITE.name}, j'ai une réclamation concernant ma commande.`)}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-dulce-orange hover:underline"
          >
            +221 77 876 01 66
          </a>{" "}
          ou par e-mail à {SITE.email}. Nous nous engageons à répondre dans les meilleurs délais.
        </p>
      </LegalSection>

      <LegalSection title="12. Données personnelles">
        <p>
          Les données collectées lors d&apos;une commande sont traitées conformément à notre{" "}
          <Link
            href="/confidentialite"
            className="font-semibold text-dulce-orange hover:underline"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="13. Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit sénégalais. En cas de différend, les
          parties s&apos;efforceront de trouver une solution amiable avant toute action
          judiciaire. À défaut, le litige relève de la compétence des juridictions sénégalaises.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
