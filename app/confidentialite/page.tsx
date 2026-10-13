import type { Metadata } from "next";
import Link from "next/link";
import { SITE, LEGAL, whatsappLink } from "@/lib/site-config";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Dulce Store collecte, pourquoi, combien de temps, et comment exercer vos droits.",
};

const responsable = LEGAL.raisonSociale.trim() || SITE.name;

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Les données que nous collectons, pourquoi, et comment en reprendre le contrôle."
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          Les données collectées sur {SITE.domain} sont traitées par {responsable}, conformément à
          la loi sénégalaise n° 2008-12 du 25 janvier 2008 portant sur la protection des données à
          caractère personnel.
        </p>
        <p>
          Pour toute question relative à vos données : {SITE.email}.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>Nous ne collectons que ce qui est nécessaire pour traiter une commande :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>votre nom et prénom ;</li>
          <li>votre numéro de téléphone WhatsApp ;</li>
          <li>votre adresse e-mail, si vous la renseignez (facultative) ;</li>
          <li>votre ville et, le cas échéant, votre quartier ou adresse de livraison ;</li>
          <li>le détail de votre commande, son montant et son statut de paiement.</li>
        </ul>
        <p>
          <strong>Nous n&apos;avons accès à aucune donnée bancaire.</strong> Les coordonnées de
          carte et les identifiants de compte mobile sont saisis directement sur l&apos;interface
          sécurisée de notre prestataire de paiement et ne transitent jamais par nos serveurs.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalités">
        <p>Ces données servent exclusivement à :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>enregistrer et traiter votre commande ;</li>
          <li>vous contacter au sujet de votre colis et des frais de livraison ;</li>
          <li>répondre à vos questions et traiter vos réclamations ;</li>
          <li>respecter nos obligations comptables et légales.</li>
        </ul>
        <p>
          Nous ne vous envoyons pas de publicité et ne revendons ni ne cédons vos données à des
          tiers à des fins commerciales.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinataires">
        <p>Vos données ne sont partagées qu&apos;avec les prestataires nécessaires à la commande :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            notre <strong>prestataire de paiement</strong>, qui reçoit votre nom et votre
            téléphone pour traiter la transaction ;
          </li>
          <li>
            notre <strong>hébergeur</strong> et le service de base de données sur lesquels le site
            fonctionne ;
          </li>
          <li>
            les <strong>transporteurs</strong> chargés d&apos;acheminer votre colis.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Durée de conservation">
        <p>
          Les données de commande sont conservées le temps nécessaire au traitement de la
          commande, puis pendant la durée légale de conservation des pièces comptables. Au-delà,
          elles sont supprimées ou anonymisées.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies et traceurs">
        <p>
          <strong>
            Ce site n&apos;utilise aucun cookie publicitaire, aucun traceur statistique et aucun
            outil d&apos;analyse d&apos;audience tiers.
          </strong>
        </p>
        <p>
          Deux mécanismes techniques seulement sont utilisés : le contenu de votre panier est
          conservé dans la mémoire locale de votre navigateur pour que vous ne le perdiez pas en
          changeant de page, et un cookie de session protège l&apos;accès à l&apos;espace
          d&apos;administration réservé à l&apos;équipe. Ni l&apos;un ni l&apos;autre ne permet de
          vous suivre sur d&apos;autres sites.
        </p>
      </LegalSection>

      <LegalSection title="7. Sécurité">
        <p>
          Le site est servi exclusivement en HTTPS. L&apos;accès aux commandes est protégé par
          mot de passe et restreint à l&apos;équipe de {SITE.name}. Nous mettons en œuvre les
          mesures raisonnables pour empêcher toute consultation ou modification non autorisée de
          vos données.
        </p>
      </LegalSection>

      <LegalSection title="8. Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et de
          suppression de vos données. Pour l&apos;exercer, écrivez-nous à {SITE.email} ou sur{" "}
          <a
            href={whatsappLink(`Bonjour ${SITE.name}, je souhaite exercer mes droits sur mes données personnelles.`)}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-dulce-orange hover:underline"
          >
            WhatsApp
          </a>
          , en précisant votre demande et votre référence de commande.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission
          de protection des données personnelles (CDP) du Sénégal —{" "}
          <a
            href="https://www.cdp.sn"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-dulce-orange hover:underline"
          >
            cdp.sn
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Modifications">
        <p>
          Cette politique peut évoluer. Toute modification est publiée sur cette page, avec mise à
          jour de la date indiquée en haut du document. Les conditions de vente figurent dans nos{" "}
          <Link href="/cgv" className="font-semibold text-dulce-orange hover:underline">
            conditions générales de vente
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
