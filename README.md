# Dulce Store

Boutique en ligne : sourcing Chine → livraison Sénégal / monde. Le prix du
produit est payé en ligne à la commande ; les frais de livraison sont réglés
séparément à l'arrivée, selon le poids ou le volume du colis.

## Démarrage

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

Le site tourne sur `http://localhost:3000`.

## Modifier le catalogue

Tout le catalogue (produits, prix, poids, specs) est dans
[`lib/catalog-data.ts`](lib/catalog-data.ts). Modifier ce fichier puis
relancer `npm run seed` pour republier les changements en base.

Les images vivent dans `public/produits/<slug>/` :
- `photo-N.jpeg` — photo produit propre (utilisée en priorité)
- `fiche-N.jpeg` — fiche technique fournisseur (peut contenir du texte)
- `affiche.jpeg` — visuel marketing Dulce Store (jamais affiché au client,
  gardé pour réemploi sur les réseaux sociaux)

Le seed choisit automatiquement la meilleure image disponible dans cet ordre :
`photo-N` > `fiche-N` > `affiche`.

## Paiement

Les paiements (Wave, Orange Money, carte bancaire) passent par un agrégateur
qui réunit ces moyens derrière une seule API. Deux sont branchés :

| Prestataire | Rôle | Variables |
|---|---|---|
| [PayDunya](https://paydunya.com) | principal | `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PRIVATE_KEY`, `PAYDUNYA_TOKEN`, `PAYDUNYA_MODE` |
| [PayTech](https://paytech.sn) | secours | `PAYTECH_API_KEY`, `PAYTECH_API_SECRET`, `PAYTECH_ENV` |

[`lib/payments/gateway.ts`](lib/payments/gateway.ts) choisit le prestataire :
PayDunya dès que ses clés sont renseignées, PayTech sinon. `PAYMENT_PROVIDER`
(`paydunya` ou `paytech`) force l'un des deux, ce qui permet de basculer sans
redéployer de code si un compte pose problème. Si aucun n'est configuré, le
site tourne en **mode simulé** : la commande est enregistrée, aucun paiement
réel n'est déclenché.

### Configurer PayDunya

1. Sur [paydunya.com](https://paydunya.com), créer une application dans
   **API d'intégration**. Elle fournit une master key, une private key, une
   public key et un token. L'API HTTP/JSON n'utilise que trois d'entre elles :
   ```
   PAYDUNYA_MASTER_KEY=...
   PAYDUNYA_PRIVATE_KEY=...
   PAYDUNYA_TOKEN=...
   PAYDUNYA_MODE=test
   ```
2. En `PAYDUNYA_MODE=test`, les appels partent vers le sandbox
   (`app.paydunya.com/sandbox-api/v1`) et rien n'est réellement encaissé.
3. Passer à `live` seulement après validation KYC du compte **et** en ayant
   remplacé les clés de test par celles de production : ce sont deux jeux de
   clés distincts.
4. L'application doit aussi être basculée en production dans le dashboard
   PayDunya (« Activer le mode production »). Tant qu'elle reste en mode test,
   l'API refuse les clés `live_` avec `4003 Logon to your PayDunya account and
   set your application mode to live`.

PayDunya refuse tout encaissement **inférieur à 200 FCFA** (`4003 Invalid Total
Amount`). Aucun produit du catalogue n'est concerné : les articles les moins
chers (95 à 99 FCFA) sont vendus par quantités minimales de 100 à 200 pièces.
Y penser avant de créer un produit bon marché sans quantité minimale.

Implémentation : [`lib/payments/paydunya.ts`](lib/payments/paydunya.ts), d'après
la doc officielle <https://developers.paydunya.com/doc/FR/http_json>.

### Configurer PayTech

1. Récupérer `API_KEY` et `API_SECRET` dans Dashboard > Réglages > API.
2. En `PAYTECH_ENV=test`, PayTech ne débite qu'un montant factice
   (100 à 150 FCFA) quel que soit le prix réel. Passer à `prod` seulement
   après activation du compte (email à contact@paytech.sn, objet "Activation
   Compte PayTech").

### Confirmation d'un paiement (IPN)

C'est la notification serveur-à-serveur, **jamais** la redirection du
navigateur, qui fait passer une commande à « payée » :

- PayDunya appelle `POST /api/webhooks/paydunya`
  ([route](app/api/webhooks/paydunya/route.ts))
- PayTech appelle `POST /api/webhooks/paytech`
  ([route](app/api/webhooks/paytech/route.ts))

Côté PayDunya, la notification est authentifiée par un `hash` (SHA-512 de la
master key), puis le statut et le montant sont **re-demandés à PayDunya** via
l'endpoint `checkout-invoice/confirm/<token>`. Une commande n'est marquée
payée que si le montant confirmé correspond exactement à son total.

Ces URL doivent être **publiques et en HTTPS**, ce que `localhost` n'est pas.
Pour tester en local :

```bash
ngrok http 3000
```

puis renseigner temporairement `NEXT_PUBLIC_SITE_URL` avec l'URL
`https://…ngrok…` fournie, redémarrer `npm run dev`, et passer une commande de
test. Sans tunnel, le paiement aboutit mais la commande reste bloquée sur
« Confirmation du paiement en cours » puisque la notification ne peut pas
atteindre `localhost`.

### Ajouter un moyen de paiement

[`lib/payments/gateway.ts`](lib/payments/gateway.ts) fait correspondre chaque
moyen de paiement à son identifiant chez les deux prestataires (`wave-senegal`
/ `"Wave"`, etc.). Pour en ajouter un (Free Money, Wizall…), compléter la table
`CHANNELS` et ajouter l'entrée correspondante à `PAYMENT_METHODS` dans
[`lib/site-config.ts`](lib/site-config.ts).

## Mise en ligne

Le domaine de la boutique est **dulce-store.com**. Au déploiement :

1. Renseigner `NEXT_PUBLIC_SITE_URL="https://dulce-store.com"` dans les
   variables d'environnement de l'hébergeur. C'est cette valeur qui construit
   l'URL d'IPN envoyée au prestataire, les URL de retour de paiement et les
   balises Open Graph — une valeur fausse casse la confirmation des commandes.
2. Renseigner les clés PayDunya et passer `PAYDUNYA_MODE=live` une fois le
   compte validé (KYC).
3. Renseigner `DATABASE_URL` avec la chaîne de connexion Neon (la même qu'en
   local), puis `npx prisma migrate deploy` sur l'environnement de production.
4. Définir `ADMIN_PASSWORD` : c'est le mot de passe d'accès à `/admin`, la page
   qui liste les commandes.

## Base de données

La base est **PostgreSQL hébergée sur [Neon](https://neon.tech)** — pas de
SQLite, car un fichier local serait effacé à chaque redéploiement et les
commandes perdues. La même base sert en local et en production ; les commandes
passées en test apparaissent donc dans `/admin`.

```bash
npx prisma migrate deploy   # applique les migrations
npm run seed                # recharge le catalogue (efface et réécrit produits + commandes)
```

Attention : `npm run seed` **supprime les commandes existantes** (il repart
d'une base propre). Ne pas le lancer en production une fois la boutique ouverte.

## Consulter les commandes

Les commandes arrivent sur **`/admin`**, protégée par `ADMIN_PASSWORD`. Chaque
commande affiche le client, ses coordonnées, le mode de livraison, le poids
estimé et un bouton WhatsApp pré-rempli pour lui communiquer les frais de port.
Il n'y a pas de notification automatique : la page se consulte.

## Structure

- `app/` — pages Next.js (App Router)
- `lib/catalog-data.ts` — catalogue produits (source de vérité)
- `lib/shipping.ts` — tarifs de livraison
- `lib/site-config.ts` — infos boutique, moyens de paiement
- `lib/payments/` — intégrations des prestataires de paiement
- `prisma/` — schéma, migrations, script de seed
