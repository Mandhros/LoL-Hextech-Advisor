/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLRole } from '../types/lol';

export interface ChampionTheoryData {
  championId: string;
  // Combos réels utilisant les noms officiels des sorts
  metaCombo: string;
  defenseCombo: string;
  offensiveCombo: string;
  metaSynergy: string;
  metaWarning: string;

  // Build 4 : Exotique Viable spécifique au champion
  exoticViable: {
    title: string;
    tagline: string;
    description: string;
    winCondition: string;
    powerSpikes: string[];
    coreItemIds: string[];
    lateItemIds: string[];
    situationalItemIds: string[];
    primaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
    primaryKeystoneIndex: number;
    comboTip: string;
    synergyHook: string;
    warningTrap: string;
  };

  // Build 5 : Signature Cheese spécifique au champion
  signatureCheese: {
    title: string;
    tagline: string;
    description: string;
    winCondition: string;
    powerSpikes: string[];
    coreItemIds: string[];
    lateItemIds: string[];
    situationalItemIds: string[];
    primaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
    primaryKeystoneIndex: number;
    comboTip: string;
    synergyHook: string;
    warningTrap: string;
  };
}

export const CHAMPION_THEORIES: Record<string, ChampionTheoryData> = {
  'Yasuo': {
    championId: 'Yasuo',
    metaCombo: "Empilez Tempête d'acier (A/Q) sur les sbires, glissez avec Cercle de lames (E) pour caler un combo E+A tournoyant, projetez la cible en l'air et déclenchez Dernier soupir (R). Intercalez Mur de vent (Z) pour bloquer les ripostes.",
    defenseCombo: "Maintenez le bouclier de la Voie du vagabond (Passif), utilisez Mur de vent (Z) pour stopper net le burst adverse et désengagez avec Cercle de lames (E) à travers la vague de sbires.",
    offensiveCombo: "Chargez la tornade (A3), effectuez un flash-combo E+A pour surprendre l'ennemi sans temps de réaction, enchaînez avec une auto-attaque avant d'activer Dernier soupir (R) puis frappez avec Force de la trinité.",
    metaSynergy: "Synergie légendaire avec tout bump ou knock-up allié (Malphite, Nautilus, Zac, Diana) pour activer instantanément l'Ultime R.",
    metaWarning: "Ne glissez pas avec votre E sous tour ennemie sans vision du jungler adverse, et gardez toujours le Mur de vent pour les sorts hostiles critiques.",
    exoticViable: {
      title: "Yasuo AP Dégâts Magiques & E-Max",
      tagline: "Glissades magiques instantanées et burst inattendu grâce aux ratios AP sur le E et l'ultime.",
      description: "Le sort Cercle de lames (E) de Yasuo possède un ratio AP cumulable avec chaque glissade consécutive et un délai de seulement 0.5s par cible. Couplé au Fléau de liche et à la Dent de Nashor, chaque attaque et chaque glissade inflige un burst magique colossal impossible à itemiser pour l'adversaire.",
      winCondition: "Désarçonner l'adversaire en phase de lane qui aura acheté des Coques en acier ou de l'Armure inutile face à vos 100% de dégâts magiques.",
      powerSpikes: ["Niveau 7 avec E au rang 4", "Achat de la Dent de Nashor & Fléau de liche", "Full Build 6 Objets 700+ Puissance"],
      coreItemIds: ['3115', '4645', '4633'], // Nashor, Shadowflame, Riftmaker
      lateItemIds: ['3089', '3157'], // Rabadon, Zhonya
      situationalItemIds: ['3135', '3102'], // Void Staff, Banshee
      primaryTree: 'Domination',
      primaryKeystoneIndex: 1, // Electrocute
      comboTip: "Glissez sur 2 sbires avec votre E pour monter les stacks de dégâts passifs du sort, puis foncez sur le champion ennemi avec le proc Fléau de liche.",
      synergyHook: "Idéal si votre équipe manque cruellement de dégâts magiques AP et que l'adversaire s'empile en Armure physique.",
      warningTrap: "Vos auto-attaques standard sans procs infligent moins de dégâts physiques purs : comptez sur vos sorts et la vitesse d'attaque de Nashor."
    },
    signatureCheese: {
      title: "Yasuo Colosse Cœuracier & Premier Coup (First Strike)",
      tagline: "Un titan intuable avec 5500+ PV et génération d'or accélérée sur chaque tornade.",
      description: "Exploite le poke à longue distance de Tempête d'acier (A3) pour activer Premier Coup (First Strike) à coup sûr. L'achat précoce de Cœuracier convertit chaque duel en charges de PV permanentes qui se cumulent avec le doublement de coups critiques de Yasuo.",
      winCondition: "Accumuler plus de 700 PV bonus avec Cœuracier avant la 20e minute et devenir un duelliste immortel impossible à burst.",
      powerSpikes: ["Achat de Cœuracier (Minute 12)", "Minute 25 avec Cœuracier + Cape solaire", "Full Build 6 Objets Colossal"],
      coreItemIds: ['3084', '3068', '3053'], // Heartsteel, Sunfire, Sterak
      lateItemIds: ['6665', '3075'], // Jak'Sho, Thornmail
      situationalItemIds: ['6664', '3083'], // Rookern, Warmog
      primaryTree: 'Inspiration',
      primaryKeystoneIndex: 0, // First Strike
      comboTip: "Envoyez la tornade A3 de loin pour déclencher First Strike, glissez au contact pour asséner le coup Cœuracier chargé et repartez sans subir de riposte.",
      synergyHook: "Transforme Yasuo en véritable frontline de mêlée capable d'absorber tous les ultimes adverses pour son équipe.",
      warningTrap: "Votre pic de puissance est légèrement différé par rapport à un build Lame d'infini classique : jouez le scaling et le stacking."
    }
  },

  'Darius': {
    championId: 'Darius',
    metaCombo: "Attirez avec Crampon (E), placez immédiatement une auto-attaque, annulez le temps d'animation avec Estropaison (Z/W) puis reculez d'un pas pour frapper avec la lame extérieure de Frappe lissée (A/Q) pour soigner et appliquer 3 effets de saignement.",
    defenseCombo: "Utilisez le bord extérieur de Frappe lissée (A/Q) pour régénérer jusqu'à 39% de vos PV manquants en plein combat de groupe, et appliquez Estropaison (Z) pour neutraliser la vitesse adverse.",
    offensiveCombo: "Empilez 5 effets de Plaie béante pour activer Force de Noxus (+230 AD bonus), puis exécutez chaque cible successivement avec Guillotine noxienne (R) qui se réinitialise instantanément.",
    metaSynergy: "Redoutable avec des alliés offrant de la vitesse de déplacement (Lulu, Karma, Zilean) ou des engages groupés (Amumu, Jarvan IV).",
    metaWarning: "Ne gaspillez pas Crampon (E) dans le vide : sans lui, vous êtes très vulnérable au kite à longue distance.",
    exoticViable: {
      title: "Darius Prédateur & Vitesse Éclair (Phase Rush)",
      tagline: "Impossible à distancer : sprint à 550+ de vitesse pour coller à toute cible fuyante.",
      description: "Résout la seule faiblesse historique de Darius : son manque de mobilité. Avec Phase Rush, Estropieur et Bottes de célérité, la moindre combinaison E + Auto + Z active un boost de 40% de vitesse et 75% de résistance aux ralentissements.",
      winCondition: "Détruire les champions ranged ou mobiles en toplane qui comptaient sur le kite pour survivre.",
      powerSpikes: ["Niveau 3 avec les 3 sorts", "Estropieur complété", "Full Build 6 Objets Furieux"],
      coreItemIds: ['6631', '3071', '6333'], // Stridebreaker, Cleaver, Death's Dance
      lateItemIds: ['3053', '3026'], // Sterak, GA
      situationalItemIds: ['4401', '3075'], // FoN, Thornmail
      primaryTree: 'Sorcery',
      primaryKeystoneIndex: 2, // Phase Rush
      comboTip: "Dès que l'ennemi s'approche d'un sbire, faites E > Auto > Z : Phase Rush s'active instantanément, vous dépassez la cible et frappez avec la lame du A.",
      synergyHook: "Rend Darius totalement autonome sans dépendre des sorts d'invocateur Flash ou Fantôme pour atteindre les carrys.",
      warningTrap: "Vous perdez les dégâts continus de Conquérant au niveau 1 : privilégiez les trades courts de 3 coups avant l'all-in 5 stacks."
    },
    signatureCheese: {
      title: "Darius Berserker Déluge de Lames (5 Stacks en 0.8s)",
      tagline: "Activation instantanée de Force de Noxus pour one-shot l'adversaire dès le niveau 1-2.",
      description: "Déluge de Lames (Hail of Blades) octroie 110% de vitesse d'attaque sur les 3 premières frappes. Couplé au reset d'auto d'Estropaison (Z), Darius applique les 5 stacks de saignement en moins d'une seconde, surprenant même les meilleurs duellistes.",
      winCondition: "Attendre dans le buisson de lane niveau 1, forcer le duel au corps à corps et récupérer le Premier Sang (First Blood) en 4 secondes.",
      powerSpikes: ["Niveau 1 dans le buisson", "Niveau 6 avec Guillotine", "Full Build 6 Objets"],
      coreItemIds: ['3153', '3078', '6610'], // BotRK, Trinity, Sundered Sky
      lateItemIds: ['3053', '3026'], // Sterak, GA
      situationalItemIds: ['6333', '3156'], // Death's Dance, Maw
      primaryTree: 'Domination',
      primaryKeystoneIndex: 2, // Hail of Blades
      comboTip: "Cachez-vous au premier buisson de toplane, attendez que l'adversaire touche le premier sbire : attaquez, enchaînez vos 3 coups ultra-rapides et claquez le Fantôme.",
      synergyHook: "Crée un tilt psychologique immédiat chez le toplaner adverse forcé de concéder toute sa première vague.",
      warningTrap: "Si vous ne prenez pas l'avantage avant le niveau 6, votre scaling en teamfight 5v5 nécessitera de temporiser vos entrées."
    }
  },

  'Aatrox': {
    championId: 'Aatrox',
    metaCombo: "Lancez A1 avec dash E pour toucher sur le bout de la lame, enchaînez Chaînes infernales (Z), frappez avec A2 en diagonale pour garder l'ennemi dans la zone du Z, et concluez au centre de A3.",
    defenseCombo: "Activez Fossoyeur des mondes (R) pour augmenter les soins de 50%, touchez plusieurs cibles avec les zones critiques de Frappe des Darkin (A) et régénérez votre barre de vie entière.",
    offensiveCombo: "Ultime R activé, avancez agressivement, touchez les 3 coups de Frappe des Darkin avec l'Hydre profane intercalée pour un burst instantané.",
    metaSynergy: "Excelle dans les combats d'équipe chaotiques où les resets de Fossoyeur des mondes (R) lui permettent de rester immortel.",
    metaWarning: "Ne ratez pas les zones douces (sweetspots) de vos A : les coups normaux infligent 50% de dégâts en moins et ne projettent pas en l'air.",
    exoticViable: {
      title: "Aatrox Assassin Létalité Darkin",
      tagline: "Des coups de lame critiques à 1800 dégâts qui pulvérisent les carrys en 1 coup.",
      description: "Convertit les ratios AD monstrueux de Frappe des Darkin en dégâts bruts grâce à l'accumulation de Létalité (Hydre profane, Éclipse, Percepteur). Un seul A3 au centre élimine instantanément n'importe quel champion fragile.",
      winCondition: "Flanquer les combats d'équipe et effacer le midlaner ou l'ADC adverse dès la première seconde d'engagement.",
      powerSpikes: ["Hydre profane terminée", "Niveau 11", "Full Build 6 Objets Létalité"],
      coreItemIds: ['6698', '6692', '6676'], // Profane, Eclipse, Collector
      lateItemIds: ['3036', '3026'], // LDR, GA
      situationalItemIds: ['3142', '6333'], // Youmuu, Death's Dance
      primaryTree: 'Domination',
      primaryKeystoneIndex: 0, // Dark Harvest
      comboTip: "Utilisez la dissimulation de buisson ou le flash : A3 + E au centre + actif Hydre profane tue un carry sans qu'il puisse réagir.",
      synergyHook: "Idéal quand la composition ennemie n'a pas de tank lourd et repose sur des tireurs et mages fragiles.",
      warningTrap: "Vous êtes bien plus fragile qu'avec un build Bruiser : si vous manquez votre sort d'ouverture, vous subirez le focus."
    },
    signatureCheese: {
      title: "Aatrox Drain-Tank Immortel (120% Omnivampirisme)",
      tagline: "Régénération infinie : passer de 5% à 100% PV en une seule frappe de mêlée.",
      description: "Combine Ciel éventré, Soif-de-sang et Gage de Sterak avec le passif Posture du massacreur et l'Ultime R. Chaque frappe critique régénère des centaines de PV bonus amplifiés par l'esprit Darkin.",
      winCondition: "Devenir un boss de raid intuable qui tanke 4 ennemis à la fois pendant que son équipe prend les objectifs.",
      powerSpikes: ["Achat de Ciel éventré", "Niveau 16 (Ultime rang 3)", "Full Build 6 Objets Régén"],
      coreItemIds: ['6610', '3078', '3053'], // Sundered Sky, Trinity, Sterak
      lateItemIds: ['6333', '3026'], // Death's Dance, GA
      situationalItemIds: ['4401', '3075'], // FoN, Thornmail
      primaryTree: 'Precision',
      primaryKeystoneIndex: 0, // Conqueror
      comboTip: "Attendez d'être sous 30% PV pour déclencher l'auto-attaque du passif couplée au coup critique de Ciel éventré : vous récupérez instantanément 1500 PV.",
      synergyHook: "Désarçonne les assassins ennemis qui gaspillent tous leurs combos sans réussir à vous achever.",
      warningTrap: "Attention aux effets d'Hémorragie sévère (40% anti-heal) : temporisez avec vos projections en l'air."
    }
  },

  'Malphite': {
    championId: 'Malphite',
    metaCombo: "Ralentissez la cible avec Éclat sismique (A/Q) pour voler sa vitesse, avancez au corps à corps, activez Frappe brutale (Z/W) puis claquez Choc au sol (E) pour réduire la vitesse d'attaque ennemie de 50%. En teamfight, touchez au moins 3 ennemis avec Force indomptable (R).",
    defenseCombo: "Profitez du Bouclier de granit (Passif) pour absorber le trade gratuit, et lancez Choc au sol (E) dès que l'assaillant tente de vous frapper.",
    offensiveCombo: "Depuis le brouillard de guerre, lâchez Force indomptable (R) sur les cibles prioritaires, puis enchaînez E + A + Z sans leur laisser le temps de toucher le sol.",
    metaSynergy: "Synergie dévastatrice avec Yasuo, Orianna, Miss Fortune et Samira lors des regroupements aux objectifs.",
    metaWarning: "Ne lancez pas votre Ultime R sur une cible isolée dotée d'un Flash si un combat de Dragon ou Baron débute dans les 30 secondes.",
    exoticViable: {
      title: "Malphite Météore One-Shot 100% AP",
      tagline: "La terreur des carrys : disparition instantanée de toute cible fragile sur un seul Ultime.",
      description: "Force indomptable (R) de Malphite possède un ratio démentiel de 120% AP, et son A possède 60% AP. Équipé du Compagnon de Luden, de Flamme-ombre et de Rabadon, Malphite supprime l'ADC et le Midlaner ennemis en 0.2 seconde sans possibilité de riposte.",
      winCondition: "Prendre en embuscade les carrys adverses isolés dans la rivière ou sur les rotations de couloir.",
      powerSpikes: ["Niveau 6 (Premier One-Shot)", "Luden + Flamme-ombre terminés", "Full Build 6 Objets 800+ AP"],
      coreItemIds: ['6655', '4645', '3089'], // Luden, Shadowflame, Rabadon
      lateItemIds: ['3135', '3157'], // Void Staff, Zhonya
      situationalItemIds: ['4629', '3102'], // Cosmic Drive, Banshee
      primaryTree: 'Domination',
      primaryKeystoneIndex: 0, // Dark Harvest
      comboTip: "Cachez-vous derrière le mur du Dragon sans vision adverse : dès que l'ADC s'approche pour poser une balise, R > E > A instantané.",
      synergyHook: "Retourne instantanément les parties où l'équipe adverse a un tireur fed mais trop confiant.",
      warningTrap: "Sans votre R disponible, vous êtes très vulnérable : jouez patiemment autour du délai de récupération de votre Ultime."
    },
    signatureCheese: {
      title: "Malphite Forteresse 1200 Armure (Anti-Full AD)",
      tagline: "Le cauchemar absolu des tireurs : vos sorts infligent des dégâts colossaux basés sur votre armure.",
      description: "Choc au sol (E) et Frappe brutale (Z) de Malphite infligent des dégâts magiques supplémentaires proportionnels à son armure totale. Avec Cotte épineuse, Présage de Randuin et Cœur gelé, Malphite atteint 1200 d'armure et détruit les champions AD rien qu'en se faisant attaquer.",
      winCondition: "Face à une composition 100% AD, avancer droit sur l'équipe ennemie qui ne peut physiquement pas entamer votre barre de vie.",
      powerSpikes: ["Coques en acier + Cotte épineuse", "3 objets d'armure achevés", "Full Build 6 Objets Colosse"],
      coreItemIds: ['3075', '3110', '3143'], // Thornmail, Frozen Heart, Randuin
      lateItemIds: ['6665', '3083'], // Jak'Sho, Warmog
      situationalItemIds: ['3068', '6664'], // Sunfire, Kaenic
      primaryTree: 'Resolve',
      primaryKeystoneIndex: 0, // Grasp
      comboTip: "Collez-vous à l'ADC ennemi et activez E : sa vitesse d'attaque sera réduite de 50%, le rendant totalement inoffensif.",
      synergyHook: "Neutralise totalement des hyper-carrys comme Jinx, Master Yi, Tryndamere ou Yasuo.",
      warningTrap: "Inutile si l'équipe adverse a 3 mages AP : dans ce cas, adaptez impérativement vers de la résistance magique (Rookern)."
    }
  },

  'Ahri': {
    championId: 'Ahri',
    metaCombo: "Projetez Bisou (E) pour charmer la cible, lancez immédiatement Orbe d'illusion (A/Q) pour assurer l'aller et le retour en dégâts bruts, tout en activant Lucioles (Z/W) pour la vitesse.",
    defenseCombo: "Utilisez les charges d'Assaut spirituel (R) pour franchir les murs et esquiver les compétences de contrôle ennemies.",
    offensiveCombo: "R dash offensif > E charme > A dégâts bruts > Z > deuxième dash R pour suivre le Flash ennemi et conclure le kill.",
    metaSynergy: "Parfaite avec des junglers assassins ou duellistes (Viego, Lee Sin, Vi) pour punir chaque Bisou réussi.",
    metaWarning: "Ne gaspillez pas votre Bisou (E) au hasard : s'il est en recharge, vous perdez votre seule protection contre les dives.",
    exoticViable: {
      title: "Ahri Duelliste Fléau de Liche & Électrocution",
      tagline: "Burst hybride ultra-agressif exploitant les dashs du R pour proc la Lame enchantée.",
      description: "Entre chaque activation d'Assaut spirituel (R) et de Lucioles (Z), Ahri cale une auto-attaque chargée par le Fléau de liche. Ce style transforme Ahri en duelliste d'escarmouche capable de remporter n'importe quel 1v1 sans dépendre uniquement du retour de son A.",
      winCondition: "Dominer les voies latérales en side-lane et assassiner les cibles isolées en duel.",
      powerSpikes: ["Fléau de liche complété", "Niveau 11", "Full Build 6 Objets"],
      coreItemIds: ['4645', '3089', '4629'], // Shadowflame, Rabadon, Cosmic
      lateItemIds: ['3157', '3135'], // Zhonya, Void Staff
      situationalItemIds: ['3102', '3151'], // Banshee, Liandry
      primaryTree: 'Domination',
      primaryKeystoneIndex: 1, // Electrocute
      comboTip: "R dash > Auto avec proc Liche > Z > Auto > E > A : les dégâts combinés surprennent par leur rapidité d'exécution.",
      synergyHook: "Prend l'avantage face aux mages statiques qui ne peuvent pas rivaliser avec votre mobilité et burst ciblé.",
      warningTrap: "Ne restez pas trop longtemps au corps à corps sans charges de R pour vous replier."
    },
    signatureCheese: {
      title: "Ahri Contrôle Glacial & Tourment de Liandry",
      tagline: "Harass permanent, brûlure en % PV max et kiting infini sur toute la frontline.",
      description: "Construit autour du Tourment de Liandry, de Volonté cosmique et de Bâton du vide. Ahri applique une brûlure continue à chaque passage d'orbe et de luciole tout en profitant d'un bonus de vitesse de 20% permanent.",
      winCondition: "Épuiser les tanks et bruisers adverses qui n'arrivent jamais à toucher Ahri en teamfight.",
      powerSpikes: ["Liandry terminé", "Volonté cosmique achetée", "Full Build 6 Objets"],
      coreItemIds: ['3151', '4629', '3157'], // Liandry, Cosmic, Zhonya
      lateItemIds: ['3089', '3135'], // Rabadon, Void Staff
      situationalItemIds: ['3102', '6655'], // Banshee, Luden
      primaryTree: 'Sorcery',
      primaryKeystoneIndex: 0, // Arcane Comet
      comboTip: "Envoyez votre A au maximum de portée pour brûler l'ensemble de la frontline ennemie avant le début du vrai combat.",
      synergyHook: "Indispensable face aux compositions adverses chargées en sacs à PV (Sion, Cho'Gath, Tahm Kench).",
      warningTrap: "Votre burst instantané est moindre : jouez les combats sur la durée et le kiting."
    }
  },

  'Jinx': {
    championId: 'Jinx',
    metaCombo: "Commencez avec Zap ! (Z/W) pour ralentir à distance, posez Pyromâcheurs (E) derrière la cible pour bloquer sa retraite, activez Poiscaille (A/Q) pour tirer des roquettes critiques de zone, et achevez les fuyards avec Super roquette de la mort (R).",
    defenseCombo: "Déposez immédiatement les Pyromâcheurs (E) à vos pieds dès qu'un assassin ou duelliste plonge sur vous, et reculez tout en switchant sur le Minigun.",
    offensiveCombo: "Dès qu'un ennemi ou une tour tombe, profitez de l'incroyable boost d'Enthousiasme ! (Passif) pour repositionner vos tirs de roquettes à 725 de portée.",
    metaSynergy: "Exceptionnelle avec les supports à engage lourd (Thresh, Nautilus, Leona) qui garantissent la capture dans les Pyromâcheurs.",
    metaWarning: "Ne gaspillez pas tout votre mana en spammant les roquettes sous la tour : alternez avec le Minigun pour farm gratuitement.",
    exoticViable: {
      title: "Jinx Sniper Létalité & Roquette Nucléaire",
      tagline: "Des tirs de Zap ! à 900 dégâts et des roquettes ultimes qui exécutent à travers la map.",
      description: "Maxe le sort Zap ! (Z) et exploite l'accumulation de Létalité avec l'Hydre profane, Youmuu et le Percepteur. Le Z possède un ratio colossal de 160% AD avec un délai de 3.5 secondes, transformant Jinx en tireur d'élite à longue portée intouchable.",
      winCondition: "Détruire la barre de vie ennemie à 1500 unités de distance avant même que le teamfight ne s'engage.",
      powerSpikes: ["Rang 5 du sort Zap !", "Lame spectre de Youmuu complétée", "Full Build 6 Objets Sniper"],
      coreItemIds: ['6698', '3142', '6676'], // Profane, Youmuu, Collector
      lateItemIds: ['3036', '3026'], // LDR, GA
      situationalItemIds: ['3072', '6692'], // BT, Eclipse
      primaryTree: 'Domination',
      primaryKeystoneIndex: 0, // Dark Harvest
      comboTip: "Tirez Zap ! depuis le brouillard de guerre : la hitbox étroite est quasiment impossible à esquiver sans vision, puis lâchez l'Ultime R.",
      synergyHook: "Parfait si votre équipe a une forte capacité de poke à longue portée (Jayce, Xerath, Lux).",
      warningTrap: "Votre vitesse de destruction de tour en auto-attaque est plus lente qu'en build critique classique : comptez sur les éliminations."
    },
    signatureCheese: {
      title: "Jinx Mitrailleuse Lourde On-Hit & Guinsoo",
      tagline: "4.5 attaques par seconde : une tornade de balles qui fait fondre n'importe quelle barre de vie.",
      description: "Exploite le bonus passif de vitesse d'attaque infini du Minigun (Pif-Paf) combiné à la Lame enragée de Guinsoo, à la Lame du roi déchu et au Tueur de krakens. Chaque troisième attaque déclenche les effets à l'impact en double.",
      winCondition: "Prendre les objectifs neutres (Baron Nashor) en moins de 10 secondes et déchiqueter les tanks.",
      powerSpikes: ["Guinsoo + Tueur de Krakens", "Niveau 13 (Minigun max)", "Full Build 6 Objets"],
      coreItemIds: ['3124', '6672', '3153'], // Guinsoo, Kraken, BotRK
      lateItemIds: ['3072', '3026'], // BT, GA
      situationalItemIds: ['3046', '3156'], // Phantom Dancer, Maw
      primaryTree: 'Precision',
      primaryKeystoneIndex: 2, // Lethal Tempo / PTA
      comboTip: "Restez en mode Minigun au corps à corps pour charger vos 3 stacks, puis laissez la cadence de tir anéantir la cible.",
      synergyHook: "Idéal aux côtés de supports enchanters apportant des effets à l'impact supplémentaires (Lulu, Milio, Nami).",
      warningTrap: "Vous devez rester plus proche de la mêlée qu'avec les roquettes : attention aux contrôles de zone."
    }
  },

  'KaiSa': {
    championId: 'Kaisa',
    metaCombo: "Lancez Rayon du néant (Z/W) pour appliquer 2 effets Plasme, activez Surintensité (E) pour vous positionner en invisibilité, lâchez Pluie d'Icathia (A) sur cible isolée et déclenchez la rupture du Plasme.",
    defenseCombo: "Utilisez Instinct meurtrier (R) pour foncer derrière une cible marquée tout en générant un énorme bouclier protecteur de 600+ PV.",
    offensiveCombo: "Touchez avec le Z à longue portée, téléportez-vous immédiatement avec le R à côté du carry ennemi, claquez A + Auto + E pour le détruire en une fraction de seconde.",
    metaSynergy: "Tout allié appliquant une immobilisation (Nautilus, Leona, Amumu) applique automatiquement une charge de Plasme pour son Ultime.",
    metaWarning: "Évitez de lancer Pluie d'Icathia (A) au milieu d'une grosse vague de sbires : les projectiles se disperseront au lieu de burst la cible.",
    exoticViable: {
      title: "Kai'Sa Artillerie Rayon du Néant AP",
      tagline: "Sniper magique à 3000 de distance avec reset de 75% du délai sur le Z.",
      description: "Focalisé sur l'évolution du Rayon du néant (Z) grâce à l'accumulation de Puissance (Dent de Nashor, Tourment de Liandry, Rabadon). Toucher un champion ennemi avec le Z réduit son temps de recharge de 75%, permettant de spammer un tir dévastateur toutes les 2 secondes.",
      winCondition: "Pilonner l'équipe adverse avant même qu'elle ne puisse approcher des objectifs du Baron ou Dragon.",
      powerSpikes: ["Évolution du Z à 100 AP", "Liandry terminé", "Full Build 6 Objets 750+ AP"],
      coreItemIds: ['3115', '3151', '3089'], // Nashor, Liandry, Rabadon
      lateItemIds: ['3157', '3135'], // Zhonya, Void Staff
      situationalItemIds: ['4645', '3102'], // Shadowflame, Banshee
      primaryTree: 'Sorcery',
      primaryKeystoneIndex: 0, // Arcane Comet
      comboTip: "Tirez le Z depuis la jungle : dès qu'il touche, le cooldown retombe à 2 secondes. Répétez 3 fois pour achever la cible avec les dégâts de rupture du Plasme.",
      synergyHook: "Désarçonne totalement les équipes sans engage directe qui se font décimer sans jamais voir Kai'Sa.",
      warningTrap: "Si vous ratez votre Z, le cooldown est complet (environ 9 secondes) : soyez précis dans vos visées."
    },
    signatureCheese: {
      title: "Kai'Sa Infiltratrice Cœuracier Drain-Tank",
      tagline: "Une ADC avec 5000 PV qui plonge au cœur de la mêlée pour stacker et assassiner.",
      description: "Associe le stacking infini de Cœuracier avec le kit d'assassinat de Kai'Sa. Après avoir touché avec le Z, Kai'Sa plonge avec son R au milieu des ennemis, encaisse tous les dégâts grâce au bouclier de l'ultime et assène le proc Cœuracier.",
      winCondition: "Surprendre les assassins adverses qui tentent de vous focus et se retrouvent face à un monstre de 5000 PV.",
      powerSpikes: ["Achat de Cœuracier", "Jak'Sho terminé", "Full Build 6 Objets Colossal"],
      coreItemIds: ['3084', '3115', '6665'], // Heartsteel, Nashor, Jak'Sho
      lateItemIds: ['3157', '3075'], // Zhonya, Thornmail
      situationalItemIds: ['6664', '3083'], // Rookern, Warmog
      primaryTree: 'Resolve',
      primaryKeystoneIndex: 0, // Grasp
      comboTip: "Z longue distance > R dans le tas > coup Cœuracier > A évolué > Zhonya pour laisser Jak'Sho et Cœuracier absorber les dégâts.",
      synergyHook: "Parfait si votre équipe manque d'un initiateur secondaire capable de survivre au centre du teamfight.",
      warningTrap: "Votre dps en début de partie est moins explosif : évitez les escarmouches prolongées avant votre premier item."
    }
  },

  'Thresh': {
    championId: 'Thresh',
    metaCombo: "Projetez Peine capitale (A/Q) pour agripper la cible, déposez Passage sombre (Z/W) vers votre allié, réactivez A pour plonger au contact, repoussez l'ennemi vers votre camp avec Fauchage (E) et enfermez avec La Boîte (R).",
    defenseCombo: "Jetez la Lanterne (Z) aux pieds de votre carry en détresse et utilisez Fauchage (E) pour interrompre les sauts ennemis (dashs de Leona, Tristana, Zac).",
    offensiveCombo: "Flankez par les buissons, lancez Fauchage (E) pour ralentir d'abord à bout portant, puis placez le grappin (A) à coup sûr sur la cible ralentie.",
    metaSynergy: "Synergie universelle avec tous les tireurs et junglers grâce au repositionnement instantané de la Lanterne.",
    metaWarning: "Ne réactivez pas systématiquement le A pour plonger dans l'équipe adverse si vous n'avez pas de relais de tanking.",
    exoticViable: {
      title: "Thresh One-Punch AD Critique & Âmes Infinies",
      tagline: "Une seule auto-attaque chargée infligeant 1800 dégâts magiques et critiques.",
      description: "Le passif de Fauchage (E) charge la prochaine auto-attaque pour infliger jusqu'à 200% de l'AD totale en dégâts magiques bonus, augmentés par chaque âme collectée. En combinant Lame d'infini, Percepteur et Soif-de-sang, une simple attaque de base supprime un carry.",
      winCondition: "Attendre patiemment la charge verte complète du passif de votre fouet et one-shot le premier carry imprudent.",
      powerSpikes: ["Percepteur terminé", "Lame d'infini achetée", "100+ Âmes récoltées"],
      coreItemIds: ['3031', '6676', '3153'], // IE, Collector, BotRK
      lateItemIds: ['3072', '3026'], // BT, GA
      situationalItemIds: ['3036', '6692'], // LDR, Eclipse
      primaryTree: 'Domination',
      primaryKeystoneIndex: 0, // Dark Harvest
      comboTip: "Restez caché dans le buisson : dès que l'ADC ennemi s'approche d'un sbire, sortez et lâchez une seule auto-attaque chargée. Le burst critique le tue sur le coup.",
      synergyHook: "Idéal en Normal Game ou pour surprendre totalement les duos botlane qui sous-estiment vos dégâts.",
      warningTrap: "Vous n'avez pas la robustesse d'un support tank : si vous ratez votre coup d'ouverture, repliez-vous immédiatement."
    },
    signatureCheese: {
      title: "Thresh Cœuracier & Titan des Âmes Immortel",
      tagline: "Armure et puissance illimitées par les âmes, couplées au scaling infini de PV de Cœuracier.",
      description: "Thresh ne gagne pas d'armure par niveau mais en absorbe à l'infini via son passif Damnation. En lui ajoutant le stacking de PV de Cœuracier et le bouclier de la Lanterne qui scale sur les âmes, il devient le tank le plus résistant du jeu.",
      winCondition: "Atteindre 30 minutes de jeu avec 6000 PV, 300 d'armure naturelle et un bouclier de lanterne à 800 PV.",
      powerSpikes: ["Achat de Cœuracier", "120 Âmes collectées", "Full Build 6 Objets"],
      coreItemIds: ['3084', '3075', '6664'], // Heartsteel, Thornmail, Kaenic
      lateItemIds: ['6665', '3083'], // Jak'Sho, Warmog
      situationalItemIds: ['3143', '3110'], // Randuin, Frozen Heart
      primaryTree: 'Resolve',
      primaryKeystoneIndex: 0, // Grasp
      comboTip: "Chaque fois que vous touchez un grappin (A), avancez pour déclencher le proc Cœuracier et récupérez les âmes au passage.",
      synergyHook: "Crée une présence terrifiante au milieu des teamfights qui décourage toute tentative de focus.",
      warningTrap: "Prenez garde à ne pas mourir bêtement en voulant ramasser des âmes trop avancées en lane."
    }
  },

  'Nautilus': {
    championId: 'Nautilus',
    metaCombo: "Lancez Coup d'ancre (A/Q) pour vous projeter sur la cible, assénez une auto-attaque pour activer Coup écrasant (Passif) et l'immobiliser, activez Colère du titan (Z/W) pour le bouclier et frappez avec Répliques (E) pour ralentir la zone.",
    defenseCombo: "Activez Colère du titan (Z) avant d'encaisser le burst, et utilisez Coup d'ancre (A) sur un mur ou un élément de décor pour vous enfuir rapidement.",
    offensiveCombo: "Verrouillez le carry avec Grenade sous-marine (R) qui le propulse en l'air de façon inéluctable, placez-vous sous son point de chute et enchaînez A + Auto Passif + E.",
    metaSynergy: "L'initiateur de référence absolu pour Samira, Kai'Sa, Yasuo et Miss Fortune.",
    metaWarning: "Faites attention à la trajectoire de votre ancre (A) : elle s'arrête au premier sbire ou décor touché.",
    exoticViable: {
      title: "Nautilus AP Titan des Abysses (Mid/Top)",
      tagline: "Des ratios AP massifs sur le bouclier et l'ultime pour anéantir les mages adverses.",
      description: "Nautilus possède des ratios AP remarquables : 90% AP sur son A, 80% AP sur son Ultime R et 50% AP par vague de son E. En construisant Tourment de Liandry et Créateur de failles, ses contrôles de foule infligent des dégâts magiques dévastateurs.",
      winCondition: "One-shot le midlaner adverse dès le niveau 6 avec le combo complet R + A + E.",
      powerSpikes: ["Niveau 6 (Kill garanti)", "Liandry terminé", "Full Build 6 Objets"],
      coreItemIds: ['3151', '4633', '4645'], // Liandry, Riftmaker, Shadowflame
      lateItemIds: ['3089', '3157'], // Rabadon, Zhonya
      situationalItemIds: ['3135', '6664'], // Void Staff, Kaenic
      primaryTree: 'Domination',
      primaryKeystoneIndex: 1, // Electrocute
      comboTip: "Verrouillez l'adversaire avec R de loin : avancez pendant que la grenade le poursuit, puis claquez votre A et votre E au moment exact où il retombe.",
      synergyHook: "Idéal pour punir les assassins mobiles (Zed, Yasuo, Katarina) qui ne peuvent pas esquiver l'Ultime ciblé.",
      warningTrap: "Vous avez moins de résistances pures en tout début de partie : ne sous-estimez pas le poke à distance adverse."
    },
    signatureCheese: {
      title: "Nautilus Full Vitesse & Ruée d'Or (Roam Express)",
      tagline: "Des bottes de célérité et une vitesse de déplacement effarante pour ganker chaque lane en continu.",
      description: "Optimisé avec Bottes de célérité, Cœuracier et Plaque du mort. Nautilus court à 520 de vitesse, ignore les ralentissements et traverse la rivière pour ganker le midlaner et le toplaner dès le niveau 3.",
      winCondition: "Gagner toutes les autres lanes en créant un surnombre permanent grâce à vos rotations ultra-rapides.",
      powerSpikes: ["Achat des Bottes de célérité", "Plaque du mort terminée", "Full Build 6 Objets"],
      coreItemIds: ['3084', '3009', '3075'], // Heartsteel, Swiftness, Thornmail
      lateItemIds: ['6665', '4401'], // Jak'Sho, FoN
      situationalItemIds: ['3143', '3083'], // Randuin, Warmog
      primaryTree: 'Resolve',
      primaryKeystoneIndex: 0, // Aftershock
      comboTip: "Dès que votre botlane a pushé, courrez tout droit au mid : arrivez derrière le champion ennemi sans même utiliser votre ancre, immobilisez-le au passif.",
      synergyHook: "Détruit le moral adverse en transformant la partie en cauchemar de roaming permanent.",
      warningTrap: "Ne laissez pas votre ADC seul trop longtemps si la botlane adverse a un fort potentiel de dive."
    }
  }
};

/**
 * Génère des builds exotiques dynamiques et adaptés pour TOUT autre champion du catalogue LoL
 * en analysant son archétype, ses tags, ses stats et la lane demandée.
 */
export function generateDynamicExoticTheory(champName: string, role: LoLRole, tags: string[], stats: any): ChampionTheoryData {
  const isMarksman = tags.includes('Marksman');
  const isMage = tags.includes('Mage');
  const isTank = tags.includes('Tank');
  const isAssassin = tags.includes('Assassin');
  const isFighter = tags.includes('Fighter');

  if (isMarksman) {
    return {
      championId: champName,
      metaCombo: `Maintenez la distance maximale d'attaque, utilisez vos compétences de poke pour préparer le terrain et activez votre vitesse d'attaque pour détruire la frontline.`,
      defenseCombo: `Gardez votre compétence de mobilité pour franchir les obstacles ou esquiver l'engage adverse, et comptez sur vos contrôles pour vous désengager.`,
      offensiveCombo: `Entamez le trade dès que le support allié contrôle une cible, appliquez vos critiques et concluez avec votre sort de burst ou votre Ultime.`,
      metaSynergy: `Sublime avec un support protecteur (Thresh, Nautilus, Lulu) capable de créer l'espace nécessaire.`,
      metaWarning: `Ne restez jamais isolé en side-lane sans balises de vision dans la jungle adjacente.`,
      exoticViable: {
        title: `${champName} Sniper Létalité & Percepteur (${role})`,
        tagline: `Maximisation du burst à longue portée et exécutions garanties.`,
        description: `Détourne la dépendance habituelle aux coups critiques en accumulant une forte pénétration d'armure avec l'Hydre profane, le Percepteur et Youmuu pour infliger des dégâts instantanés avec les compétences.`,
        winCondition: `Éliminer les cibles fragiles à distance sans jamais entrer dans la portée de représailles ennemie.`,
        powerSpikes: [`1er objet de Létalité`, `Niveau 11`, `Full Build 6 Objets`],
        coreItemIds: ['6698', '6676', '3036'],
        lateItemIds: ['3026', '3072'],
        situationalItemIds: ['3142', '6692'],
        primaryTree: 'Domination',
        primaryKeystoneIndex: 0,
        comboTip: `Déclenchez votre sort offensif principal depuis le brouillard de guerre pour surprendre la cible.`,
        synergyHook: `Parfait pour faire fondre les équipes composées principalement de mages et d'assassins sans tank.`,
        warningTrap: `Moins efficace face aux compositions avec 3 tanks colossaux empilant de l'armure.`
      },
      signatureCheese: {
        title: `${champName} Mitrailleuse On-Hit & Guinsoo (${role})`,
        tagline: `Cadence de tir infernale et doublement des effets à l'impact.`,
        description: `Combine la Lame enragée de Guinsoo, la Lame du roi déchu et le Tueur de krakens pour saturer l'adversaire de dégâts par seconde incalculables.`,
        winCondition: `Faire fondre les tanks et neutraliser les monstres épiques (Baron Nashor) à une vitesse record.`,
        powerSpikes: [`Guinsoo terminée`, `BotRK complétée`, `Full Build 6 Objets On-Hit`],
        coreItemIds: ['3124', '3153', '6672'],
        lateItemIds: ['3072', '3026'],
        situationalItemIds: ['3046', '3156'],
        primaryTree: 'Precision',
        primaryKeystoneIndex: 1,
        comboTip: `Chargez vos attaques sur la frontline pour déclencher le passif de Guinsoo avant de rediriger les tirs sur les carrys.`,
        synergyHook: `Déchiquette les sacs à PV adverses grâce aux dégâts en % PV actuels de la BotRK.`,
        warningTrap: `Exige une excellente gestion du positionnement (kiting) pour ne pas subir de contrôle de zone.`
      }
    };
  }

  if (isMage) {
    return {
      championId: champName,
      metaCombo: `Touchez avec votre sort d'entrave ou de contrôle pour garantir l'impact de l'intégralité de votre rotation de sorts magiques.`,
      defenseCombo: `Restez en retrait derrière votre ligne de front, temporisez avec le Sablier de Zhonya si vous êtes focus et replacez-vous.`,
      offensiveCombo: `Surprenez la cible avec votre compétence à plus longue portée, déclenchez l'Ultime et achevez avec le burst magique combiné.`,
      metaSynergy: `Excellent avec toute initiation de groupe permettant d'aligner vos compétences de zone.`,
      metaWarning: `Surveillez scrupuleusement votre réserve de mana avant d'engager un combat de dragon prolongé.`,
      exoticViable: {
        title: `${champName} Brûlure Max PV & Kiting Infini (${role})`,
        tagline: `Fonte continue des barres de vie avec Tourment de Liandry et Volonté cosmique.`,
        description: `Ce build remplace le burst classique par un harcèlement constant : chaque sort applique la brûlure en pourcentage de PV max tout en vous conférant un bonus massif de vitesse de déplacement.`,
        winCondition: `Épuiser l'équipe adverse à l'usure avant chaque objectif neutre.`,
        powerSpikes: [`Liandry achevé`, `Volonté cosmique achetée`, `Full Build 6 Objets`],
        coreItemIds: ['3151', '4629', '4645'],
        lateItemIds: ['3089', '3157'],
        situationalItemIds: ['3135', '3102'],
        primaryTree: 'Sorcery',
        primaryKeystoneIndex: 0,
        comboTip: `Lancez vos compétences à portée maximale pour maintenir la brûlure sans vous exposer.`,
        synergyHook: `Démolit les compositions axées sur des colosses et tanks avec beaucoup de PV.`,
        warningTrap: `Votre burst instantané sur une cible unique est plus diffus : combattez dans la durée.`
      },
      signatureCheese: {
        title: `${champName} Fléau de Liche & Assassinat Instantané (${role})`,
        tagline: `Intercalation d'attaques enchantées pour un one-shot en une fraction de seconde.`,
        description: `Ajoute le proc destructeur du Fléau de liche entre vos compétences pour surprendre l'adversaire avec des dégâts ciblés instantanés.`,
        winCondition: `Assassiner les cibles isolées sur les rotations de la rivière.`,
        powerSpikes: [`Fléau de liche complété`, `Niveau 9`, `Full Build 6 Objets`],
        coreItemIds: ['4645', '3089', '3157'],
        lateItemIds: ['3135', '4629'],
        situationalItemIds: ['3102', '6655'],
        primaryTree: 'Domination',
        primaryKeystoneIndex: 1,
        comboTip: `Sort de contrôle > Auto avec proc Liche > sort de burst : l'adversaire meurt avant la fin du contrôle.`,
        synergyHook: `Permet de punir les champions fuyants dotés de boucliers de sorts.`,
        warningTrap: `Nécessite d'entrer à portée d'auto-attaque : attention aux contre-engages.`
      }
    };
  }

  // Bruiser / Tank / Default
  return {
    championId: champName,
    metaCombo: `Engagez avec votre contrôle ou mobilité, collez à la cible avec vos attaques de base et réactivez vos sorts offensifs dès récupération.`,
    defenseCombo: `Absorbez le choc initial avec vos résistances, temporisez avec vos compétences défensives et régénérez en combat.`,
    offensiveCombo: `Avancez agressivement, bloquez la retraite ennemie et appliquez vos dégâts continus pour forcer le repli adverse.`,
    metaSynergy: `Crée la ligne de front idéale pour permettre aux tireurs et mages alliés d'infliger leurs dégâts en toute sécurité.`,
    metaWarning: `Ne partez pas trop loin devant sans vous assurer que votre équipe est à portée de suivi.`,
    exoticViable: {
      title: `${champName} Duelliste Hybride & Drain-Tank (${role})`,
      tagline: `Vampirisme et dégâts mixtes pour dominer les 1v1 en side-lane.`,
      description: `Associe des objets de combat hybrides (Force de la trinité, Lame du roi déchu, Danse de la mort) pour devenir inarrêtable en duel et scinder la carte.`,
      winCondition: `Gagner chaque 1v1 sur les voies latérales et forcer au moins 2 adversaires à venir défendre.`,
      powerSpikes: [`1er objet de duel`, `Niveau 11`, `Full Build 6 Objets`],
      coreItemIds: ['3078', '3153', '3071'],
      lateItemIds: ['6333', '3026'],
      situationalItemIds: ['3053', '6610'],
      primaryTree: 'Precision',
      primaryKeystoneIndex: 0,
      comboTip: `Intercalez systématiquement une auto-attaque entre chaque utilisation de compétence pour maximiser le DPS.`,
      synergyHook: `Excellente pression sur les tours et prise d'objectifs en solitaire.`,
      warningTrap: `Gardez toujours un œil sur la carte : si les ennemis disparaissent, repliez-vous.`
    },
    signatureCheese: {
      title: `${champName} Titan Cœuracier & Ruée d'Or (${role})`,
      tagline: `Croissance illimitée de PV et colosse de teamfight inarrêtable.`,
      description: `Capitalise sur le cumul permanent de PV de Cœuracier couplé aux résistances de Jak'Sho et de la Cape solaire pour transformer ${champName} en monstre de raid.`,
      winCondition: `Dépasser les 5000 PV et traverser les lignes ennemies sans subir de dégâts significatifs.`,
      powerSpikes: [`Achat de Cœuracier`, `Cape solaire complétée`, `Full Build 6 Objets Colossal`],
      coreItemIds: ['3084', '3068', '6665'],
      lateItemIds: ['3075', '6664'],
      situationalItemIds: ['3083', '3143'],
      primaryTree: 'Resolve',
      primaryKeystoneIndex: 0,
      comboTip: `Collez au champion ennemi le plus exposé pour charger et faire exploser le coup Cœuracier dès que disponible.`,
      synergyHook: `Offre une présence colossale qui monopolise l'attention et les cooldowns adverses.`,
      warningTrap: `Prenez garde aux champions dotés de dégâts bruts en pourcentage de PV max (Vayne, Fiora).`
    }
  };
}
