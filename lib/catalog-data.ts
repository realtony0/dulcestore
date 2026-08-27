/**
 * Catalogue Dulce Store.
 *
 * Les prix, dimensions et coloris viennent des visuels fournis dans
 * `public/produits/<slug>/`. Les poids marqués `weightEstimated: true` n'étaient
 * pas indiqués sur les fiches fournisseur : ils sont estimés et doivent être
 * confirmés, car ils servent à l'estimation des frais de fret.
 *
 * Pour modifier le catalogue : éditer ce fichier puis relancer `npm run seed`.
 */

export type SeedVariant = {
  name: string;
  priceFCFA: number;
  weightKg: number;
};

export type SeedSpec = { label: string; value: string };

export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  subcategory: string;
  /** Prix de la variante la moins chère (ou prix unique). */
  priceFCFA: number;
  weightKg: number;
  weightEstimated?: boolean;
  minOrderQty?: number;
  colors?: string[];
  variants?: SeedVariant[];
  specs?: SeedSpec[];
};

export type SeedSubcategory = { slug: string; name: string };

export type SeedCategory = {
  slug: string;
  name: string;
  tagline: string;
  subcategories: SeedSubcategory[];
  products: SeedProduct[];
};

export const CATALOG: SeedCategory[] = [
  {
    slug: "cuisine-pro",
    name: "Cuisine Pro",
    tagline: "Khana li nekhoul — matériel et machines pour professionnels",
    subcategories: [
      { slug: "machines", name: "Machines" },
      { slug: "materiel-cuisine-professionnel", name: "Matériel de cuisine professionnel" },
      { slug: "petit-equipement", name: "Petit équipement" },
    ],
    products: [
      {
        slug: "creperie-simple",
        name: "Crêpière à gaz ou électrique",
        tagline: "Idéale pour vos crêpes parfaites à chaque fois",
        description:
          "Crêpière simple plaque, disponible en version gaz ou électrique. Plaque anti-adhésive facile à nettoyer, chauffe rapide et uniforme, structure inox robuste conçue pour un usage intensif.",
        subcategory: "materiel-cuisine-professionnel",
        priceFCFA: 57500,
        weightKg: 14,
        weightEstimated: true,
        specs: [
          { label: "Alimentation", value: "Gaz ou électrique (au choix)" },
          { label: "Plaque", value: "Anti-adhésive, nettoyage au chiffon" },
          { label: "Structure", value: "Inox robuste et durable" },
        ],
      },
      {
        slug: "creperie-double",
        name: "Crêpière double à gaz ou électrique",
        tagline: "Deux plaques pour doubler votre cadence",
        description:
          "Crêpière double plaque pour les services soutenus. Version gaz (modèle SZY-1G) ou électrique (modèle SZY-2E), chauffe rapide et uniforme, entretien facile.",
        subcategory: "materiel-cuisine-professionnel",
        priceFCFA: 110500,
        weightKg: 26,
        specs: [
          { label: "Modèle gaz", value: "SZY-1G — 25,53 kg" },
          { label: "Modèle électrique", value: "SZY-2E — 27,2 kg, 1,5 kW + 1,5 kW" },
          { label: "Dimensions", value: "900 × 540 × 230 mm" },
          { label: "Température", value: "50 à 300 °C (électrique)" },
        ],
      },
      {
        slug: "gaufrier-simple",
        name: "Gaufrier électrique",
        tagline: "Des gaufres parfaites à chaque fois",
        description:
          "Gaufrier électrique simple à plaques rondes. Chauffe rapide et uniforme, température réglable, facile à utiliser et à nettoyer. Idéal pour un usage maison ou professionnel.",
        subcategory: "petit-equipement",
        priceFCFA: 30980,
        weightKg: 6.48,
        specs: [
          { label: "Modèle", value: "SZ-WM1" },
          { label: "Puissance", value: "1200 W" },
          { label: "Tension", value: "220–240 V" },
          { label: "Température", value: "50 à 300 °C" },
          { label: "Dimensions", value: "250 × 320 × 195 mm" },
          { label: "Poids net", value: "6,48 kg" },
        ],
      },
      {
        slug: "gaufrier-double",
        name: "Gaufrier double électrique",
        tagline: "Double plaque, double production",
        description:
          "Gaufrier double à chauffe sur les deux faces pour une cuisson homogène et économe en énergie. Deux plaques indépendantes, chacune avec sa commande de température.",
        subcategory: "petit-equipement",
        priceFCFA: 65960,
        weightKg: 11.8,
        specs: [
          { label: "Modèle", value: "SZ-WM2" },
          { label: "Puissance", value: "2400 W (1200 W + 1200 W)" },
          { label: "Tension", value: "220–240 V" },
          { label: "Température", value: "50 à 300 °C" },
          { label: "Dimensions", value: "500 × 320 × 195 mm" },
          { label: "Poids net", value: "11,8 kg" },
        ],
      },
      {
        slug: "friteuse-gaz",
        name: "Friteuse à gaz",
        tagline: "Rapide, puissante et économique",
        description:
          "Friteuse à gaz en inox épais avec panier et thermomètre à huile offert. Contrôle de température précis, chauffe rapide et uniforme. Idéale pour frites, beignets, poulet et poisson.",
        subcategory: "materiel-cuisine-professionnel",
        priceFCFA: 24840,
        weightKg: 6,
        weightEstimated: true,
        specs: [
          { label: "Dimensions", value: "39 × 29 × 28,5 cm" },
          { label: "Matériau", value: "Inox épais" },
          { label: "Offert", value: "Thermomètre à huile et kit d'outils" },
        ],
      },
      {
        slug: "friteuse-double-gaz",
        name: "Friteuse double à gaz",
        tagline: "Deux bacs pour deux cuissons en parallèle",
        description:
          "Friteuse double à gaz en inox épais, deux bacs indépendants avec paniers et couvercles. Robinet gaz basse pression, contrôle de température précis. Thermomètre offert.",
        subcategory: "materiel-cuisine-professionnel",
        priceFCFA: 37260,
        weightKg: 11,
        weightEstimated: true,
        specs: [
          { label: "Dimensions", value: "55 × 39 × 28,5 cm" },
          { label: "Puissance", value: "2 × 1200 W" },
          { label: "Robinet de gaz", value: "0,6 – 1,2 L, basse pression" },
          { label: "Gaz", value: "Gaz naturel / LPG" },
          { label: "Offert", value: "Thermomètre et kit d'outils" },
        ],
      },
      {
        slug: "machine-pancake-9",
        name: "Machine à pancake 9 compartiments à gaz",
        tagline: "Rapide, pratique et économique",
        description:
          "Machine à gaz 9 compartiments de 8 cm. Chauffe rapide et uniforme, contrôle précis de la chaleur. Parfaite pour pancakes, dorayaki, galettes, hamburgers, œufs et mini-crêpes.",
        subcategory: "machines",
        priceFCFA: 26085,
        weightKg: 8,
        weightEstimated: true,
        specs: [
          { label: "Compartiments", value: "9 × Ø 8 cm, profondeur 2,5 cm" },
          { label: "Taille de la plaque", value: "26,5 × 26,5 cm" },
          { label: "Dimensions machine", value: "29 × 35 × 14 cm" },
          { label: "Valve de gaz", value: "0,6 basse pression" },
        ],
      },
      {
        slug: "machine-pancake-18",
        name: "Machine à pancake 18 compartiments à gaz",
        tagline: "Le double de production, la même simplicité",
        description:
          "Machine à gaz 18 compartiments de 10 cm, deux zones de chauffe indépendantes. Pour les volumes de production élevés : pancakes, dorayaki, hamburgers, œufs et mini-crêpes.",
        subcategory: "machines",
        priceFCFA: 67485,
        weightKg: 16,
        weightEstimated: true,
        specs: [
          { label: "Compartiments", value: "18 × Ø 10 cm, profondeur 2,5 cm" },
          { label: "Taille de la plaque", value: "33 × 33 cm" },
          { label: "Dimensions machine", value: "65 × 41 × 14 cm" },
          { label: "Puissance", value: "2 × 1200 W" },
          { label: "Valve de gaz", value: "0,6 basse pression" },
        ],
      },
      {
        slug: "machine-popcorn",
        name: "Machine garde popcorn",
        tagline: "Popcorn chaud, croustillant et prêt à vendre à tout moment",
        description:
          "Vitrine chauffante qui conserve le popcorn chaud et croustillant pendant des heures. Éclairage LED haute visibilité, grande capacité, inox robuste. Pensée pour cinémas, KTV, snacks, foires et événements.",
        subcategory: "machines",
        priceFCFA: 68865,
        weightKg: 18,
        specs: [
          { label: "Dimensions", value: "45 × 45 × 55 cm" },
          { label: "Puissance", value: "600 W" },
          { label: "Tension", value: "220 V" },
          { label: "Matériau", value: "Inoxydable" },
          { label: "Poids", value: "18 kg" },
        ],
      },
      {
        slug: "blender-pro",
        name: "Blender Pro",
        tagline: "Puissant, rapide et silencieux",
        description:
          "Blender professionnel sous cloche insonorisante. Lames inox 304 très tranchantes, 5 niveaux de vitesse, moteur 1500 W. Pour smoothies, jus, soupes, milkshakes, glaces et sauces.",
        subcategory: "machines",
        priceFCFA: 41400,
        weightKg: 6,
        weightEstimated: true,
        specs: [
          { label: "Capacité", value: "2 litres" },
          { label: "Puissance", value: "1500 W" },
          { label: "Vitesses", value: "5 niveaux" },
          { label: "Lames", value: "Inox 304" },
          { label: "Matériau du bol", value: "PC alimentaire sans BPA" },
          { label: "Protection", value: "Couvercle anti-bruit" },
        ],
      },
      {
        slug: "machine-lisser-gateau",
        name: "Machine à lisser gâteau",
        tagline: "Pour des gâteaux parfaits, lisses et professionnels",
        description:
          "Machine à lisser la crème pour un fini impeccable sur vos gâteaux. Plateau tournant Ø 30 cm, panneau de contrôle digital intelligent, moteur puissant. Idéale pour pâtisseries, boulangeries, hôtels, restaurants et traiteurs.",
        subcategory: "machines",
        priceFCFA: 118680,
        weightKg: 20,
        weightEstimated: true,
        colors: ["Blanc", "Rose", "Vert"],
        specs: [
          { label: "Plateau tournant", value: "Ø 30 cm" },
          { label: "Contrôle", value: "Panneau digital intelligent" },
          { label: "Coloris", value: "Blanc, rose ou vert" },
        ],
      },
      {
        slug: "robot-patissier-20l",
        name: "Robot pâtissier 20 litres",
        tagline: "Le partenaire idéal pour pâtisseries, pains et crèmes",
        description:
          "Robot pâtissier professionnel B20, bol inox de 20 litres et 3 accessoires inclus (fouet, crochet pétrisseur, batteur plat). Moteur puissant pour un mélange homogène, structure solide pour un usage intensif.",
        subcategory: "machines",
        priceFCFA: 224950,
        weightKg: 73,
        variants: [
          { name: "Sans couvercle", priceFCFA: 224950, weightKg: 73 },
          { name: "Avec couvercle de protection", priceFCFA: 241500, weightKg: 75 },
        ],
        specs: [
          { label: "Modèle", value: "B20" },
          { label: "Capacité", value: "20 litres" },
          { label: "Puissance", value: "1,1 kW" },
          { label: "Tension", value: "220 / 380 V — 50 Hz" },
          { label: "Capacité de pâte", value: "5 kg" },
          { label: "Vitesses", value: "360 / 166 / 100 tr/min" },
          { label: "Poids net", value: "73 kg" },
          { label: "Dimensions", value: "55 × 42 × 77 cm" },
          { label: "Accessoires inclus", value: "Fouet, crochet pétrisseur, batteur plat" },
        ],
      },
    ],
  },
  {
    slug: "packaging",
    name: "Packaging",
    tagline: "Flacons, bouteilles, canettes et boîtes pour votre activité",
    subcategories: [
      { slug: "boites", name: "Boîtes" },
      { slug: "emballages-alimentaires", name: "Emballages alimentaires" },
      { slug: "flacons-cosmetiques", name: "Flacons cosmétiques" },
    ],
    products: [
      {
        slug: "flacon-serum",
        name: "Flacon à sérum",
        tagline: "Élégant, pratique, professionnel",
        description:
          "Flacon en verre dépoli de haute qualité avec pipette anti-goutte précise. Idéal pour huiles, sérums et soins cosmétiques. Disponible en 4 coloris de bouchon.",
        subcategory: "flacons-cosmetiques",
        priceFCFA: 135,
        weightKg: 0.061,
        minOrderQty: 100,
        colors: ["Doré", "Argenté", "Rosé", "Noir"],
        variants: [
          { name: "50 ml", priceFCFA: 135, weightKg: 0.061 },
          { name: "100 ml", priceFCFA: 165, weightKg: 0.094 },
        ],
        specs: [
          { label: "50 ml", value: "Hauteur 115 mm — Ø 37 mm — 61 g" },
          { label: "100 ml", value: "Hauteur 135 mm — Ø 45 mm — 94 g" },
          { label: "Matériau", value: "Verre dépoli haute qualité" },
          { label: "Pipette", value: "Anti-goutte, dosage précis" },
        ],
      },
      {
        slug: "canette-plastique",
        name: "Canette en plastique",
        tagline: "Pratique, légère, résistante",
        description:
          "Canette PET transparente au design moderne pour mettre vos produits en valeur. Étanche, réutilisable et légère. Idéale pour boissons, smoothies, jus et desserts. Plusieurs couvercles au choix.",
        subcategory: "emballages-alimentaires",
        priceFCFA: 95,
        weightKg: 0.03,
        weightEstimated: true,
        minOrderQty: 200,
        colors: ["Easy Open argent", "Easy Open doré", "Easy Open noir", "Ouverture complète", "Ouverture complète rouge", "Couvercle à tamis"],
        variants: [
          { name: "330 ml", priceFCFA: 95, weightKg: 0.028 },
          { name: "355 ml", priceFCFA: 105, weightKg: 0.032 },
        ],
        specs: [
          { label: "330 ml", value: "Hauteur 115 mm — Ø 55 mm" },
          { label: "355 ml", value: "Hauteur 122 mm — Ø 55 mm" },
          { label: "Matériau", value: "PET alimentaire sans BPA" },
          { label: "Résistance", value: "-30 °C à 60 °C" },
          { label: "Conditionnement", value: "200 pièces par carton" },
        ],
      },
      {
        slug: "bouteille-jus",
        name: "Bouteille de jus",
        tagline: "Pratique, résistante, étanche",
        description:
          "Bouteille PET alimentaire à large goulot, transparente et étanche. Idéale pour jus, smoothies, thés glacés, laits végétaux, sauces et desserts. 9 bouchons au choix.",
        subcategory: "emballages-alimentaires",
        priceFCFA: 95,
        weightKg: 0.03,
        weightEstimated: true,
        minOrderQty: 100,
        colors: ["Or", "Or avec trou", "Noir", "Blanc", "Argent", "Argent avec trou", "Orange", "Bouchon à poignée", "Bouchon à rabat"],
        variants: [
          { name: "250 ml", priceFCFA: 95, weightKg: 0.028 },
          { name: "300 ml", priceFCFA: 98, weightKg: 0.032 },
        ],
        specs: [
          { label: "Goulot", value: "Ø 3,8 cm" },
          { label: "Matériau", value: "PET alimentaire" },
          { label: "Étanchéité", value: "Bouchon anti-fuite" },
          { label: "Conditionnement", value: "88 pièces par carton (250 ml)" },
        ],
      },
      {
        slug: "boite-cupcake",
        name: "Boîte à cupcakes",
        tagline: "Emballez avec soin, sublimez vos cupcakes",
        description:
          "Boîte blanche en carton épais avec fenêtre transparente et support alvéolé inclus. Recyclable, sécuritaire et robuste. Parfaite pour cupcakes, muffins, bouchées et mini-gâteaux.",
        subcategory: "boites",
        priceFCFA: 155,
        weightKg: 0.06,
        weightEstimated: true,
        minOrderQty: 100,
        variants: [
          { name: "6 alvéoles", priceFCFA: 155, weightKg: 0.06 },
          { name: "12 alvéoles", priceFCFA: 285, weightKg: 0.1 },
        ],
        specs: [
          { label: "6 alvéoles", value: "23,5 × 15,8 × 7,5 cm" },
          { label: "12 alvéoles", value: "30,5 × 22,8 × 9 cm" },
          { label: "Matériau", value: "Carton blanc épais, recyclable" },
          { label: "Fenêtre", value: "Transparente, pleine visibilité" },
          { label: "Support", value: "Alvéoles incluses" },
        ],
      },
    ],
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    tagline: "Montres, bijoux et gadgets tendance",
    subcategories: [
      { slug: "bijoux-montres", name: "Bijoux & Montres" },
      { slug: "gadgets", name: "Gadgets" },
    ],
    products: [
      {
        slug: "bracelet-montre-perle",
        name: "Bracelet montre à perle",
        tagline: "Élégance, délicatesse, intemporel",
        description:
          "Un bracelet raffiné qui allie la beauté des perles à l'élégance d'une montre délicate. Perles brillantes et acier inoxydable durable, fermeture coulissante ajustable pour un confort optimal. Parfait pour le quotidien, les fêtes ou comme cadeau élégant.",
        subcategory: "bijoux-montres",
        priceFCFA: 1100,
        weightKg: 0.06,
        weightEstimated: true,
        colors: ["Perle ambrée", "Perle grise", "Perle blanche"],
        specs: [
          { label: "Matériaux", value: "Perles et acier inoxydable" },
          { label: "Fermeture", value: "Coulissante, ajustable" },
          { label: "Mouvement", value: "Quartz" },
        ],
      },
      {
        slug: "bracelet-montre-snake",
        name: "Bracelet montre Snake Shaped",
        tagline: "Élégant, unique, tendance",
        description:
          "Un design serpent sophistiqué qui sublime votre poignet avec audace et raffinement. Forme enroulée élégante, finition plaquée or et acier inoxydable, bracelet souple et flexible qui s'adapte parfaitement au poignet. Aucun minimum de commande.",
        subcategory: "bijoux-montres",
        priceFCFA: 3450,
        weightKg: 0.12,
        weightEstimated: true,
        colors: ["Or noir", "Or blanc", "Argent blanc", "Argent noir"],
        specs: [
          { label: "Finition", value: "Plaqué or / acier inoxydable" },
          { label: "Bracelet", value: "Souple et flexible, ajustable" },
          { label: "Mouvement", value: "Quartz" },
          { label: "Lunette", value: "Sertie de strass" },
        ],
      },
      {
        slug: "brosse-vapeur-cheveux",
        name: "Brosse à vapeur pour les cheveux",
        tagline: "Lisse, hydrate, protège",
        description:
          "La puissance de la vapeur pour des cheveux doux, brillants et sans frisottis. Vapeur nano qui hydrate en profondeur et réduit les dommages thermiques, massage du cuir chevelu, température constante. Compacte et portable, idéale à la maison comme en voyage.",
        subcategory: "gadgets",
        priceFCFA: 2885,
        weightKg: 0.3,
        weightEstimated: true,
        colors: ["Crème", "Rose", "Violet", "Bleu"],
        specs: [
          { label: "Fonction", value: "Vapeur nano hydratante" },
          { label: "Effets", value: "Démêle, réduit les frisottis, anti-statique" },
          { label: "Massage", value: "Picots stimulant le cuir chevelu" },
          { label: "Alimentation", value: "Rechargeable USB" },
          { label: "À noter", value: "Ne lisse pas les cheveux : elle démêle, hydrate et protège" },
        ],
      },
    ],
  },
  {
    slug: "beaute",
    name: "Beauté",
    tagline: "Soins du visage et accessoires beauté",
    subcategories: [{ slug: "accessoires-beaute", name: "Accessoires beauté" }],
    products: [
      {
        slug: "brosse-lymphatique-visage",
        name: "Brosse lymphatique pour visage",
        tagline: "Soin naturel, doux, efficace",
        description:
          "Stimule la circulation lymphatique, détoxifie et sculpte les contours du visage pour une peau éclatante et tonifiée. Bois naturel et poils doux pour un soin tout en délicatesse. Convient à tous les types de peau, à sec ou avec huile ou sérum.",
        subcategory: "accessoires-beaute",
        priceFCFA: 1900,
        weightKg: 0.15,
        weightEstimated: true,
        specs: [
          { label: "Matériau", value: "Bois naturel, poils doux" },
          { label: "Zones", value: "Visage, mâchoire et cou" },
          { label: "Usage", value: "À sec ou avec huile / sérum" },
          { label: "Type de peau", value: "Tous types de peau" },
          { label: "Inclus", value: "Coffret et pochette de rangement" },
        ],
      },
    ],
  },
];
