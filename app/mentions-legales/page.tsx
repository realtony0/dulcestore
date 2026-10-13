import type { Metadata } from "next";
import Link from "next/link";
import { SITE, LEGAL, HOSTING } from "@/lib/site-config";
import { LegalLayout, LegalSection, LegalField } from "@/components/legal-layout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Éditeur, hébergeur et informations légales du site ${SITE.domain}.`,
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro={`Informations relatives à l'éditeur et à l'hébergement du site ${SITE.domain}.`}
    >
      <LegalSection title="1. Éditeur du site">
        <p>
          Le site {SITE.domain} est édité par :
        </p>
        <dl className="divide-y divide-dulce-ink/10 overflow-hidden rounded-lg border border-dulce-border">
          <LegalField label="Raison sociale" value={LEGAL.raisonSociale} />
          <LegalField label="Forme juridique" value={LEGAL.formeJuridique} />
          <LegalField label="Capital social" value={LEGAL.capitalSocial} />
          <LegalField label="Siège social" value={LEGAL.siege} />
          <LegalField label="RCCM" value={LEGAL.rccm} />
          <LegalField label="NINEA" value={LEGAL.ninea} />
          <LegalField label="Directeur de la publication" value={LEGAL.directeurPublication} />
          <LegalField label="E-mail" value={SITE.email} />
          <LegalField label="Téléphone / WhatsApp" value="+221 77 876 01 66" />
        </dl>
        <p className="text-sm text-dulce-ink/60">
          Ces mentions sont publiées en application de l&apos;article 10 de la loi sénégalaise
          n° 2008-08 du 25 janvier 2008 sur les transactions électroniques.
        </p>
      </LegalSection>

      <LegalSection title="2. Hébergement">
        <p>
          Le site est hébergé par {HOSTING.nom} ({HOSTING.pays}) —{" "}
          <a
            href={HOSTING.site}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-dulce-orange hover:underline"
          >
            {HOSTING.site.replace("https://", "")}
          </a>
          . Les données de commande sont stockées sur une base de données hébergée dans
          l&apos;Union européenne, et les photos des produits sur le service de stockage
          Cloudflare R2.
        </p>
      </LegalSection>

      <LegalSection title="3. Propriété intellectuelle">
        <p>
          La structure du site, son identité visuelle, ses textes et sa mise en page sont la
          propriété de {SITE.name}. Toute reproduction ou réutilisation sans autorisation écrite
          préalable est interdite.
        </p>
        <p>
          Les photographies et fiches techniques des produits proviennent de nos fournisseurs et
          restent la propriété de leurs titulaires respectifs. Si vous estimez qu&apos;un contenu
          publié porte atteinte à vos droits, écrivez-nous à {SITE.email} : il sera retiré sans
          délai le temps de la vérification.
        </p>
      </LegalSection>

      <LegalSection title="4. Responsabilité">
        <p>
          Les informations publiées sur le site sont fournies avec le plus grand soin. Les
          photographies, dimensions et poids des produits sont toutefois communiqués par nos
          fournisseurs et présentent un caractère indicatif : de légères différences avec le
          produit livré sont possibles.
        </p>
        <p>
          Les délais de livraison annoncés sont des estimations qui dépendent du transport
          international et des formalités douanières. Ils ne constituent pas un engagement ferme.
          Les conditions détaillées de la vente figurent dans nos{" "}
          <Link href="/cgv" className="font-semibold text-dulce-orange hover:underline">
            conditions générales de vente
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Données personnelles">
        <p>
          Le traitement des données des clients est décrit dans notre{" "}
          <Link
            href="/confidentialite"
            className="font-semibold text-dulce-orange hover:underline"
          >
            politique de confidentialité
          </Link>
          , conformément à la loi n° 2008-12 du 25 janvier 2008 portant sur la protection des
          données à caractère personnel.
        </p>
      </LegalSection>

      <LegalSection title="6. Droit applicable">
        <p>
          Le présent site et son contenu sont soumis au droit sénégalais. Tout litige relatif à
          son utilisation relève de la compétence des juridictions sénégalaises, après recherche
          d&apos;une solution amiable.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
