/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuneTreeKey, RuneSelection } from '../types/lol';

export interface RuneInfo {
  id: string;
  name: string;
  tree: RuneTreeKey;
  isKeystone: boolean;
  iconUrl: string;
  description: string;
}

export const RUNE_TREES_META: Record<RuneTreeKey, {
  name: string;
  color: string;
  iconUrl: string;
  keystones: { name: string; iconUrl: string; description: string }[];
  slots: { name: string; iconUrl: string; description: string }[];
}> = {
  Precision: {
    name: 'Précision',
    color: '#C8AA6E',
    iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png',
    keystones: [
      { name: 'Conquérant', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png', description: "Cumule de la Force Adaptative en attaquant. À 12 charges, convertit les dégâts en soins." },
      { name: 'Attaque soutenue (PTA)', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png', description: "Toucher un champion avec 3 attaques consécutives inflige des dégâts bonus et expose la cible." },
      { name: 'Jeu de jambes', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png', description: "Attaquer et se déplacer génère de l'Énergie. À 100%, la prochaine attaque soigne et octroie de la vitesse." },
    ],
    slots: [
      { name: 'Triomphe', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Triumph.png', description: "Les éliminations de champions restaurent 5% des PV manquants et octroient 20 PO supplémentaires." },
      { name: 'Présence d\'esprit', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png', description: "Infliger des dégâts à un champion régénère du mana ou de l'énergie." },
      { name: 'Légende : Alacrité', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png', description: "Augmente de manière permanente la vitesse d'attaque à chaque élimination." },
      { name: 'Légende : Sangsue', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png', description: "Augmente le vol de vie et les PV max au fil de la partie." },
      { name: 'Coup de grâce', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png', description: "Inflige 8% de dégâts supplémentaires aux champions ayant moins de 40% de leurs PV." },
      { name: 'Baroud d\'honneur', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LastStand/LastStand.png', description: "Inflige 5% à 11% de dégâts bonus lorsque vous êtes sous 60% de vos PV." },
    ]
  },
  Domination: {
    name: 'Domination',
    color: '#DC2626',
    iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7200_Domination.png',
    keystones: [
      { name: 'Électrocution', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Electrocute/Electrocute.png', description: "Toucher un champion avec 3 attaques ou sorts différents inflige un burst de foudre adaptatif." },
      { name: 'Moisson noire', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png', description: "Endommager un champion sous 50% de PV arrache son âme pour infliger des dégâts et stacker à l'infini." },
      { name: 'Déluge de lames', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png', description: "Confère un bonus colossal de vitesse d'attaque pour les 3 prochaines attaques de base." },
    ],
    slots: [
      { name: 'Ruée offensive', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png', description: "Après un saut, téléportation ou invisibilité, inflige des dégâts bruts bonus." },
      { name: 'Goût du sang', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png', description: "Infliger des dégâts à un champion ennemi soigne périodiquement." },
      { name: 'Arracheur d\'œil', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/EyeballCollection/EyeballCollection.png', description: "Récolte des globes oculaires lors des éliminations pour gagner de l'AD ou de l'AP permanent." },
      { name: 'Chasseur acharné', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png', description: "Augmente la vitesse de déplacement hors-combat pour chaque champion abattu." },
      { name: 'Chasseur ultime', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/UltimateHunter/UltimateHunter.png', description: "Réduit drastiquement le délai de récupération du sort Ultime (R)." },
    ]
  },
  Sorcery: {
    name: 'Sorcellerie',
    color: '#3B82F6',
    iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7202_Sorcery.png',
    keystones: [
      { name: 'Comète arcanique', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png', description: "Toucher un champion projette une comète à son emplacement qui inflige des dégâts magiques." },
      { name: 'Rush phasique', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png', description: "3 sorts ou attaques octroient une impulsion de vitesse de déplacement et 75% de résistance aux slows." },
      { name: 'Invocation d\'Aery', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/SummonAery/SummonAery.png', description: "Vos attaques et sorts envoient Aery pour blesser l'ennemi ou poser un bouclier sur vos alliés." },
    ],
    slots: [
      { name: 'Ruban de mana', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png', description: "Toucher un champion avec un sort augmente définitivement votre mana max jusqu'à 250." },
      { name: 'Transcendance', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Transcendence/Transcendence.png', description: "Gagne de l'accélération de compétence aux niveaux 5 et 8, et réduit les délais résiduels lors d'un kill." },
      { name: 'Brûlure', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Scorch/Scorch.png', description: "Votre prochaine compétence embrase le champion ennemi pour lui infliger des dégâts magiques sur 1s." },
      { name: 'Tempête menaçante', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png', description: "Gagne des montants infinis et croissants d'AD ou d'AP toutes les 10 minutes de jeu." },
    ]
  },
  Resolve: {
    name: 'Volonté',
    color: '#10B981',
    iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png',
    keystones: [
      { name: 'Poigne de l\'immortel (Grasp)', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png', description: "Toutes les 4s en combat, votre attaque vole des PV, inflige des dégâts max PV et augmente vos PV max permanents." },
      { name: 'Après-coup', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png', description: "Immobiliser un champion confère un bonus massif d'Armure/RM puis explose en zone." },
      { name: 'Gardien', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Guardian/Guardian.png', description: "Protéger un allié proche qui subit des dégâts lui accorde un solide bouclier protecteur." },
    ],
    slots: [
      { name: 'Démolition', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Demolish/Demolish.png', description: "Charge une frappe colossale démolissant les tourelles ennemies." },
      { name: 'Second souffle', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/SecondWind/SecondWind.png', description: "Après avoir subi des dégâts, régénère une partie des PV manquants sur 10s (idéal vs poke)." },
      { name: 'Plaque d\'os', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/BonePlating/BonePlating.png', description: "Après avoir pris des dégâts, les 3 prochaines attaques/sorts ennemis infligent beaucoup moins de dégâts." },
      { name: 'Surcroissance', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Overgrowth/Overgrowth.png', description: "Absorbe la force vitale des sbires et monstres morts à proximité pour gonfler vos PV max." },
      { name: 'Inébranlable', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Unflinching/Unflinching.png', description: "Confère de la Résistance aux ralentissements et de l'Armure / RM supplémentaire." },
    ]
  },
  Inspiration: {
    name: 'Inspiration',
    color: '#06B6D4',
    iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7203_Inspiration.png',
    keystones: [
      { name: 'Premier coup (First Strike)', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png', description: "Initier le combat accorde 7% de dégâts bonus pendant 3s et génère 100% de ces dégâts en pièces d'or réelles." },
      { name: 'Optimisation glaciale', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png', description: "Immobiliser un champion projette 3 rayons de givre qui ralentissent et réduisent les dégâts subis par les alliés." },
      { name: 'Grimoire déchaîné', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png', description: "Permet de changer de sorts d'invocateur en cours de partie pour s'adapter à la situation." },
    ],
    slots: [
      { name: 'Chaussures magiques', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png', description: "Obtenez des bottes gratuites à 12 minutes (réduit avec les éliminations), avec +10 vitesse bonus." },
      { name: 'Livraison de biscuits', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png', description: "Reçoit des biscuits régénérant des PV et augmentant le mana max en début de partie." },
      { name: 'Savoir cosmique', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png', description: "+18 Accélération des sorts d'invocateur (Flash/TP) et +10 Accélération des objets actifs." },
      { name: 'Canotier temporel', iconUrl: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png', description: "Consommer une potion ou un biscuit restaure immédiatement 50% de ses effets." },
    ]
  }
};

export const DEFAULT_SHARDS = {
  offense: "+9 Force Adaptative (+5.4 AD ou +9 AP)",
  flex: "+9 Force Adaptative (ou +2% Vitesse de déplacement)",
  defense: "+65 PV de base (+10-180 PV selon le niveau)",
};
