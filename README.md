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

## Paiement — PayTech

Les paiements (Wave, Orange Money, carte bancaire) passent par
[PayTech](https://paytech.sn), qui agrège ces moyens de paiement derrière une
seule API. PayPal est géré séparément (PayTech ne le couvre pas).

Tant que `PAYTECH_API_KEY` / `PAYTECH_API_SECRET` sont vides dans `.env`, le
site fonctionne en **mode simulé** : la commande est enregistrée mais aucun
paiement réel n'est déclenché.

### Configuration

1. Créer un compte sur [paytech.sn](https://paytech.sn), récupérer
   `API_KEY` et `API_SECRET` dans Dashboard > Réglages > API.
2. Les renseigner dans `.env` (jamais dans le code, jamais commités) :
   ```
   PAYTECH_API_KEY=...
   PAYTECH_API_SECRET=...
   PAYTECH_ENV=test
   ```
3. En `PAYTECH_ENV=test`, PayTech ne débite qu'un montant factice
   (100 à 150 FCFA) quel que soit le prix réel — pratique pour tester le
   parcours complet sans frais. Passer à `prod` seulement après activation du
   compte PayTech (email à contact@paytech.sn, objet "Activation Compte
   PayTech").

### Tester l'IPN (webhook) en local

PayTech confirme un paiement en appelant `POST /api/webhooks/paytech` sur le
site — c'est cette notification serveur-à-serveur, jamais la redirection du
navigateur, qui fait passer une commande à "payée"
([`app/api/webhooks/paytech/route.ts`](app/api/webhooks/paytech/route.ts)).
Cette URL doit être **publique et en HTTPS**, ce que `localhost` n'est pas.

Pour tester en local :

```bash
ngrok http 3000
```

puis renseigner temporairement `NEXT_PUBLIC_SITE_URL` avec l'URL `https://…ngrok…`
fournie, redémarrer `npm run dev`, et passer une commande de test. Sans
tunnel, le paiement PayTech fonctionnera mais la commande restera bloquée sur
"Confirmation du paiement en cours" puisque la notification ne peut pas
atteindre `localhost`.

### Ajouter une méthode de paiement à PayTech

`lib/payments/paytech.ts` centralise l'appel à l'API PayTech. Les fichiers
`lib/payments/wave.ts`, `orange-money.ts` et `card.ts` ne font que lui passer
le bon `target_payment` ("Wave", "Orange Money", "Carte Bancaire"). Pour
ajouter un mode PayTech supplémentaire (Wizall, Free Money…), dupliquer un de
ces fichiers avec la nouvelle valeur et l'ajouter à `PAYMENT_METHODS` dans
[`lib/site-config.ts`](lib/site-config.ts).

## Mise en ligne

Le domaine de la boutique est **dulce-store.com**. Au déploiement :

1. Renseigner `NEXT_PUBLIC_SITE_URL="https://dulce-store.com"` dans les
   variables d'environnement de l'hébergeur. C'est cette valeur qui construit
   l'`ipn_url` envoyée à PayTech, les URL de retour de paiement et les balises
   Open Graph — une valeur fausse casse la confirmation des commandes.
2. Passer `PAYTECH_ENV=prod` une fois le compte PayTech activé.
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
