/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLChampion, LoLRole, DraftState, DraftSuggestion, CoachDraftDiagnosis, CompAnalysis } from '../types/lol';
import { riotDataService } from './riotDataService';
import { buildEngine } from './buildEngine';

// Base de connaissances stratégique de niveau Coach des Worlds
interface MatchupKnowledge {
  championId: string;
  counters: string[]; // Champions contrés durement
  counterReason: (enemyName: string) => string;
  synergies: string[]; // Champions alliés favoris
  synergyReason: (allyName: string) => string;
  blindSafeScore: number; // 0 - 100
  lanePlan: string;
  teamfightPlan: string;
  trapWarning: string;
}

const WORLDS_TACTICAL_KNOWLEDGE: Record<string, MatchupKnowledge> = {
  // === TOPLANE ===
  Aatrox: {
    championId: 'Aatrox',
    counters: ['Sion', 'Chogath', 'Malphite', 'Shen', 'DrMundo', 'Kled', 'Nasus', 'Gwen'],
    counterReason: (e) => `Zone ${e} à distance avec le tranchant des 3 A. Annule son armure grâce aux dégâts max PV et au sustain de l'Épée des Darkin.`,
    synergies: ['Sejuani', 'JarvanIV', 'Rakan', 'Orianna', 'Maokai'],
    synergyReason: (a) => `Enchaîne son A3 et son Z sur les contrôles de zone de ${a} pour décimer la ligne de front.`,
    blindSafeScore: 92,
    lanePlan: "Prenez l'ascendant au niveau 3 avec le combo A1 + E + A2 + Z. Ne gaspillez pas le dash E avant de forcer le flash adverse.",
    teamfightPlan: "Flankez par les ailes avec l'ultime Fossoyeur des mondes activé pour réinitialiser la vitesse et la peur sur chaque kill.",
    trapWarning: "Très vulnérable aux champions à burst ultra-rapide avant son premier item (Attention à Irelia/Fiora)."
  },
  Fiora: {
    championId: 'Fiora',
    counters: ['Ornn', 'Chogath', 'Kled', 'Malphite', 'Sion', 'Mordekaiser', 'Aatrox', 'Ksante', 'TahmKench'],
    counterReason: (e) => `Fait fondre ${e} avec les dégâts bruts en % des PV max des Points Vitaux. Sa Riposte (Z) neutralise et étourdit sur le contrôle majeur de ${e}.`,
    synergies: ['Galio', 'Shen', 'TwistedFate', 'Pantheon'],
    synergyReason: (a) => `Met une pression colossale en split-push pendant que ${a} peut intervenir instantanément avec son ultime global.`,
    blindSafeScore: 78,
    lanePlan: "Priorisez les pokes sur les points vitaux au A sans aggro excessive des sbires. Gardez le Z pour parer le sort clé ennemi.",
    teamfightPlan: "Split-push 1v3 sur les voies latérales. Si teamfight forcé, posez l'ultime Défi suprême sur le frontline pour déclencher la zone de soin collective.",
    trapWarning: "Ne teamfightez pas de front en 5v5 face à une composition de poke ou de gros CC groupés."
  },
  Poppy: {
    championId: 'Poppy',
    counters: ['Riven', 'Irelia', 'Camille', 'Yasuo', 'Jax', 'Aatrox', 'Renekton', 'JarvanIV', 'LeeSin'],
    counterReason: (e) => `La Présence Immuable (Z) stoppe net 100% des dashs et sauts de ${e}, rendant son kit totalement inoffensif.`,
    synergies: ['Vayne', 'Anivia', 'Trundle', 'Gnar', 'Ornn'],
    synergyReason: (a) => `Plaque les ennemis sur les murs créés par ${a} ou prolonge les stuns pour des exécutions immédiates.`,
    blindSafeScore: 88,
    lanePlan: "Ramassez régulièrement le bouclier du passif pour échanger des coups gratuits. Plaquez au E dès que l'adversaire s'approche du décor.",
    teamfightPlan: "Utilisez l'ultime chargé pour éjecter le jungler ou le carry ennemi hors de la fosse du Baron/Dragon.",
    trapWarning: "Peut manquer de dégâts pour achever les cibles si les carrys alliés ne suivent pas immédiatement l'engage."
  },
  Renekton: {
    championId: 'Renekton',
    counters: ['Yasuo', 'Yone', 'Irelia', 'Riven', 'Kayle', 'Camille', 'Akali'],
    counterReason: (e) => `Le Z sous 50 Furie détruit instantanément les boucliers de ${e} et l'étourdit pendant 1.5s, le one-shotant sous burst.`,
    synergies: ['Elise', 'Nidalee', 'Taliyah', 'LeeSin'],
    synergyReason: (a) => `Garantit un dive sous tourelle létal niveau 3 grâce au point-and-click stun combiné au burst de ${a}.`,
    blindSafeScore: 90,
    lanePlan: "Contrôlez les vagues et accumulez 50 de furie avant d'amorcer le trade E -> Z renforcé -> A -> E retrait.",
    teamfightPlan: "Plongez sur les carrys fragiles avec Dominus pour absorber les dégâts et disperser l'équipe adverse.",
    trapWarning: "Attention au scaling en late game : forcez des escarmouches et des clôtures d'objectifs avant 25-30 minutes."
  },
  Gwen: {
    championId: 'Gwen',
    counters: ['Sion', 'Chogath', 'Ornn', 'Malphite', 'DrMundo', 'Ksante', 'TahmKench'],
    counterReason: (e) => `Découpe les résistances de ${e} grâce aux dégâts bruts au centre des Ciseaux et devient inciblable à distance avec sa Brume.`,
    synergies: ['JarvanIV', 'Rakan', 'Amumu', 'Leona'],
    synergyReason: (a) => `Déclenche l'ultime Piqûre à triple lancer sur le pack ennemi regroupé et contrôlé par ${a}.`,
    blindSafeScore: 82,
    lanePlan: "Chargez 4 stacks de ciseaux sur les sbires avant d'envoyer le A au centre de l'adversaire. Utilisez le Z pour esquiver les pokes.",
    teamfightPlan: "Activez la Brume sacrée pour ignorer les carrys arrière adverses et liquéfier les tanks de devant.",
    trapWarning: "Phase de jeu délicate avant le premier objet (Dent de Nashor ou Volonté Cosmique) contre les bruisers hyper-agressifs."
  },

  // === JUNGLE ===
  JarvanIV: {
    championId: 'JarvanIV',
    counters: ['MissFortune', 'Jhin', 'Ashe', 'Xerath', 'Velkoz', 'Lux', 'Aphelios', 'Twitch'],
    counterReason: (e) => `Verrouille ${e} sans dash dans l'Arène du Cataclysme (R), le condamnant sans échappatoire possible.`,
    synergies: ['Orianna', 'MissFortune', 'Rumble', 'Yasuo', 'Samira', 'Galio'],
    synergyReason: (a) => `Crée la zone de pack parfaite avec son Cataclysme pour l'ultime dévastateur de ${a}.`,
    blindSafeScore: 94,
    lanePlan: "Gank rapide niveau 2 ou 3 avec combo E+A + Flash. Prenez la priorité des scuttles et forcez les flashs adverses.",
    teamfightPlan: "Engagez sur les carrys immobiles avec E+A+R, puis activez le Z pour ralentir et encaisser le contre-burst.",
    trapWarning: "Attention à ne pas enfermer vos propres carrys fragiles dans l'Arène face à des colosses comme Darius ou Sett."
  },
  Sejuani: {
    championId: 'Sejuani',
    counters: ['MasterYi', 'KhaZix', 'Diana', 'Belveth', 'Briar', 'Viego'],
    counterReason: (e) => `Étouffe complètement l'agressivité de ${e} avec 3 stuns consécutifs et l'Armure de Glace qui divise les bursts par deux.`,
    synergies: ['Renekton', 'Yone', 'Sylas', 'Akali', 'Kaisa', 'Braum'],
    synergyReason: (a) => `Chaque attaque de mêlée de ${a} applique les stacks de Pergélisol pour geler les cibles en moins d'une seconde.`,
    blindSafeScore: 95,
    lanePlan: "Farmez en sécurité jusqu'au niveau 4, puis gankez les lanes alliées au corps à corps pour des stuns instantanés.",
    teamfightPlan: "Initiez avec la Prison de Glace (R) longue portée sur une cible clé pour forcer une supériorité numérique immédiate.",
    trapWarning: "Ne jouez pas Sejuani avec 4 carrys à distance qui ne peuvent pas empiler le passif de gel."
  },
  Viego: {
    championId: 'Viego',
    counters: ['Karthus', 'LeeSin', 'Graves', 'JarvanIV'],
    counterReason: (e) => `Profite de la moindre erreur de placement de ${e} pour obtenir la première possession et enchaîner les réinitialisations.`,
    synergies: ['Nautilus', 'Leona', 'Lissandra', 'Renekton', 'Thresh'],
    synergyReason: (a) => `Bénéficie du setup de contrôle lourd de ${a} pour garantir le premier kill et activer son passif invincible.`,
    blindSafeScore: 84,
    lanePlan: "Jouez le tempo et les escarmouches d'objectifs 2v2/3v3. Utilisez le brouillard pour approcher sans être vu.",
    teamfightPlan: "Attendez que le premier ennemi descende à 20% PV, exécutez au R, volez l'âme et enchaînez les compétences adverses.",
    trapWarning: "Ne soyez jamais le premier à sauter dans la mêlée en 5v5 sans avoir de cible à exécuter immédiatement."
  },

  // === MIDLANE ===
  Orianna: {
    championId: 'Orianna',
    counters: ['Annie', 'Vex', 'Cassiopeia', 'Ryze', 'Malzahar', 'Galio'],
    counterReason: (e) => `Out-range ${e} en permanence avec la Sphère sans jamais s'exposer à sa portée d'attaque ou de contrôle.`,
    synergies: ['JarvanIV', 'Malphite', 'Rakan', 'Zac', 'Amumu', 'Wukong'],
    synergyReason: (a) => `Attache la Sphère sur ${a} pendant son engage pour déclencher une Onde de Choc (R) à 5 personnes inévitable.`,
    blindSafeScore: 96,
    lanePlan: "Zonez continuellement avec le A+Z et gardez le bouclier E pour gagner tous les échanges d'auto-attaques passives.",
    teamfightPlan: "Gardez la Sphère dans les goulets d'étranglement de la jungle et punissez tout regroupement adverse.",
    trapWarning: "Très sensible aux ganks avant le niveau 6 si vous poussez la vague sans vision dans les buissons latéraux."
  },
  Sylas: {
    championId: 'Sylas',
    counters: ['Malphite', 'Alun', 'Rakan', 'Swain', 'Amumu', 'TwistedFate', 'Lissandra', 'Ashe'],
    counterReason: (e) => `Vole l'ultime surpuissant de ${e} et l'utilise avec de meilleurs ratios AP, tout en se soignant au Régicide (Z).`,
    synergies: ['Sejuani', 'LeeSin', 'Nautilus', 'Nocturne'],
    synergyReason: (a) => `Combine sa mobilité et son burst magique avec les contrôles de ${a} pour des dives infaillibles.`,
    blindSafeScore: 80,
    lanePlan: "Attendez le niveau 3 pour trade avec E1 -> E2 -> Passif -> Z -> A. Ne gaspillez pas le Z sur des cibles avec beaucoup de PV.",
    teamfightPlan: "Volez le meilleur ultime utilitaire ou de teamfight (ex: Malphite, Amumu) pour initier avec un avantage écrasant.",
    trapWarning: "Difficile si l'équipe ennemie ne possède aucun ultime utile ou facilement exploitable (ex: Kog'Maw, Zoe, Samira)."
  },
  Ahri: {
    championId: 'Ahri',
    counters: ['Lux', 'Velkoz', 'Xerath', 'Ziggs', 'Hwei', 'AurelionSol'],
    counterReason: (e) => `Franchit tous les tirs de compétence de ${e} grâce aux 3 dashs de l'Assaut Spirituel et le charme à bout portant.`,
    synergies: ['Vi', 'LeeSin', 'JarvanIV', 'Pantheon'],
    synergyReason: (a) => `Sécurise le kill sur n'importe quel gank grâce au Charme (E) garanti sur les cibles verrouillées par ${a}.`,
    blindSafeScore: 95,
    lanePlan: "Push au A et décalage immédiat sur les escarmouches de la rivière ou les escarmouches au bot.",
    teamfightPlan: "Jouez sur les angles de vision pour assassiner un carry isolé ou kite les bruisers avec la mobilité des dashs.",
    trapWarning: "Ne lancez pas le Charme à l'aveugle sans setup contre des cibles mobiles qui peuvent esquiver."
  },

  // === BOTLANE (ADC) ===
  Xayah: {
    championId: 'Xayah',
    counters: ['Samira', 'Nautilus', 'Leona', 'Zed', 'KhaZix', 'Rengar', 'Diana'],
    counterReason: (e) => `Devient totalement inciblable avec Rafale de Plumes (R) au moment du dive de ${e}, puis l'enracine au rappel des plumes (E).`,
    synergies: ['Rakan', 'Nautilus', 'Thresh', 'Milio', 'Braum'],
    synergyReason: (a) => `Bénéficie de la protection et du repositionnement de ${a} pour aligner les plumes derrière les adversaires.`,
    blindSafeScore: 95,
    lanePlan: "Posez des plumes avec le A et les attaques passives, attendez que l'adversaire s'avance pour le punir d'un E instantané.",
    teamfightPlan: "Kitez vers l'arrière face aux assauts ennemis en laissant les plumes se poser devant vous avant d'enraciner la comp adverse.",
    trapWarning: "Ne gâchez jamais votre ultime pour du simple poke ; c'est votre unique garantie de survie."
  },
  Jinx: {
    championId: 'Jinx',
    counters: ['Aphelios', 'Vayne', 'KaiSa', 'Zeri', 'Twitch'],
    counterReason: (e) => `Surclasse la portée de ${e} avec le Lance-roquettes Poiscaillou (725 de portée) et la harcèle sans riposte possible.`,
    synergies: ['Thresh', 'Lulu', 'Milio', 'Blitzcrank', 'Nautilus'],
    synergyReason: (a) => `Déclenche son passif d'Euphorie dès que ${a} verrouille et élimine la première cible, devenant inarrêtable.`,
    blindSafeScore: 88,
    lanePlan: "Poussez la vague avec Poiscaillou au niveau 1 pour obtenir la priorité niveau 2. Posez les pyromâcheurs derrière les ennemis.",
    teamfightPlan: "Restez à portée maximale des roquettes, attendez la première assistance pour foncer à vitesse supersonique.",
    trapWarning: "Zéro dash naturel : exige un positionnement irréprochable et un peel constant contre les assassins."
  },
  KaiSa: {
    championId: 'KaiSa',
    counters: ['Ezreal', 'Jhin', 'MissFortune', 'Ashe'],
    counterReason: (e) => `Isole et assassine ${e} en fonçant directement sur lui avec Instinct Meurtrier (R) dès qu'un contrôle allié touche.`,
    synergies: ['Nautilus', 'Leona', 'Rell', 'Alistar', 'Thresh'],
    synergyReason: (a) => `Chaque immobilisation de ${a} applique des charges de Plasma pour une détonation explosive instantanée.`,
    blindSafeScore: 86,
    lanePlan: "Échangez les coups courts pour appliquer 5 charges de Plasma. Isolez vos A sur les champions plutôt que sur les sbires.",
    teamfightPlan: "Utilisez l'ultime comme un repositionnement ou une barrière de survie pour éliminer la backline ennemie.",
    trapWarning: "Courte portée de base (525) : évitez de vous faire poke gratuitement avant le déclenchement du combat."
  },

  // === SUPPORT ===
  Thresh: {
    championId: 'Thresh',
    counters: ['Leona', 'Zac', 'Tristana', 'Diana', 'JarvanIV', 'Rengar', 'Alistar'],
    counterReason: (e) => `Le Coup de Faux (E) coupe net les sauts et engages aériennes de ${e}, tandis que la Lanterne sauve tout allié en danger.`,
    synergies: ['Jinx', 'Draven', 'Samira', 'Lucian', 'Kalista'],
    synergyReason: (a) => `Offre un gap-close ou une issue de secours à ${a} tout en maintenant la cible immobile avec Peine Capitale.`,
    blindSafeScore: 94,
    lanePlan: "Menacez constamment avec la posture de hook. Utilisez le passif E pour infliger de lourds pokes magiques sur l'ADC adverse.",
    teamfightPlan: "Gardez la lanterne pour votre carry fragile et utilisez la Boîte (R) pour dissoudre l'élan de l'équipe adverse.",
    trapWarning: "Ne prenez pas toujours la deuxième activation du A si cela vous projette au milieu de 5 ennemis sans suivi."
  },
  Nautilus: {
    championId: 'Nautilus',
    counters: ['Zeri', 'Lucian', 'Ahri', 'Katarina', 'Ezreal', 'Sona', 'Yuumi'],
    counterReason: (e) => `L'ultime Charge des profondeurs (R) est un point-and-click inesquivable qui suit ${e} même à travers ses dashs.`,
    synergies: ['KaiSa', 'Samira', 'MissFortune', 'Yasuo', 'Tristana'],
    synergyReason: (a) => `Applique 4 formes de contrôles consécutives pour garantir 100% des dégâts des sorts explosifs de ${a}.`,
    blindSafeScore: 92,
    lanePlan: "Recherchez l'affrontement niveau 2 immédiat avec Grappin + Auto passive + Réplique. Prenez le contrôle des buissons.",
    teamfightPlan: "Lancez le R sur le carry principal ennemi et verrouillez les autres cibles avec le passif d'immobilisation.",
    trapWarning: "Une fois engagé avec le A, vous n'avez pas de sort d'échappée : choisissez le moment opportun."
  },
  Lulu: {
    championId: 'Lulu',
    counters: ['Zed', 'KhaZix', 'MasterYi', 'Talon', 'Rengar', 'Yasuo'],
    counterReason: (e) => `La Métamorphose (W) transforme ${e} en écureuil inoffensif au moment exact de son plongeon, ruinant son assassinat.`,
    synergies: ['Jinx', 'KogMaw', 'Vayne', 'Twitch', 'Zeri'],
    synergyReason: (a) => `Multiplie la vitesse d'attaque, la portée et la durabilité de ${a} avec Pix et Croissance Prodigieuse (R).`,
    blindSafeScore: 93,
    lanePlan: "Harcelez au A et avec les tirs de Pix. Gardez la Métamorphose pour stopper toute agression du botlane adverse.",
    teamfightPlan: "Collez votre ADC comme son ombre : Bouclier E, Vitesse/Polymorphe W, et R pour repousser les assaillants.",
    trapWarning: "Ne gaspillez pas la métamorphose pour un simple boost de vitesse allié si un assassin rôde dans les parages."
  }
};

export class CoachEngine {
  /**
   * Analyse complète de niveau Coach des Worlds
   */
  generateWorldsDraftAnalysis(
    playerRole: LoLRole,
    allies: DraftState['allies'],
    enemies: DraftState['enemies'],
    bans: DraftState['bans']
  ): { suggestions: DraftSuggestion[]; diagnosis: CoachDraftDiagnosis } {
    // 1. Détection des champions interdits (déjà choisis ou bannis)
    const unavailableIds = new Set<string>();
    Object.values(allies).forEach(c => { if (c) unavailableIds.add(c.id); });
    Object.values(enemies).forEach(c => { if (c) unavailableIds.add(c.id); });
    (bans.blue || []).forEach(c => { if (c) unavailableIds.add(c.id); });
    (bans.red || []).forEach(c => { if (c) unavailableIds.add(c.id); });

    // 2. Évaluation des compositions
    const compAnalysis = buildEngine.analyzeComp({
      playerRole,
      playerChampion: null,
      allies,
      enemies,
      bans
    });

    const allyList = Object.values(allies).filter(Boolean) as LoLChampion[];
    const enemyList = Object.values(enemies).filter(Boolean) as LoLChampion[];
    const directOpponent = enemies[playerRole];

    // Calcul du ratio AD / AP allié
    let allyAdCount = 0;
    let allyApCount = 0;
    let allyCcCount = 0;
    let allyTankCount = 0;

    for (const c of allyList) {
      if (c.tags.includes('Marksman') || c.tags.includes('Fighter')) allyAdCount += 1.5;
      if (c.tags.includes('Mage')) allyApCount += 1.5;
      if (c.tags.includes('Tank')) { allyTankCount++; allyCcCount += 2; }
      if (c.tags.includes('Assassin')) allyAdCount += 1;
    }

    const allyNeedsAp = allyList.length >= 2 && allyApCount <= 0.5;
    const allyNeedsFrontline = allyList.length >= 2 && allyTankCount === 0;
    const allyNeedsCc = allyList.length >= 2 && allyCcCount <= 1;

    // 3. Diagnostic textuel du coach des Worlds
    const diagnosis = this.buildCoachDiagnosis(
      playerRole,
      directOpponent,
      allyList,
      enemyList,
      compAnalysis,
      allyNeedsAp,
      allyNeedsFrontline
    );

    // 4. Filtrage et sélection des champions compétitifs disponibles
    const allChamps = riotDataService.getAllChampions();
    const roleChamps = allChamps.filter(c => 
      !unavailableIds.has(c.id) && (c.roles.includes(playerRole) || this.isCompetitiveFlex(c.id, playerRole))
    );

    // 5. Génération des 4 catégories tactiques d'un Coach des Worlds
    const suggestions: DraftSuggestion[] = [];
    const chosenIds = new Set<string>();

    // CATEGORIE 1 : CONTRE-PICK CHIRURGICAL (S+ TIER)
    const counterPick = this.findBestCounterPick(
      roleChamps,
      directOpponent,
      enemyList,
      chosenIds,
      compAnalysis,
      allyNeedsAp
    );
    if (counterPick) {
      suggestions.push(counterPick);
      chosenIds.add(counterPick.champion.id);
    }

    // CATEGORIE 2 : SYNERGIE 5v5 & WOMBO COMBO (S TIER)
    const synergyPick = this.findBestSynergyPick(
      roleChamps,
      allyList,
      chosenIds,
      allyNeedsAp,
      allyNeedsFrontline
    );
    if (synergyPick) {
      suggestions.push(synergyPick);
      chosenIds.add(synergyPick.champion.id);
    }

    // CATEGORIE 3 : BLIND-PICK INÉBRANLABLE (S TIER)
    const blindPick = this.findBestBlindSafePick(
      roleChamps,
      directOpponent,
      chosenIds,
      allyNeedsAp
    );
    if (blindPick) {
      suggestions.push(blindPick);
      chosenIds.add(blindPick.champion.id);
    }

    // CATEGORIE 4 : CHEESE SURPRISE / FLEX POCKET PICK (A+ TIER)
    const cheesePick = this.findBestCheesePick(
      roleChamps,
      playerRole,
      directOpponent,
      chosenIds
    );
    if (cheesePick) {
      suggestions.push(cheesePick);
      chosenIds.add(cheesePick.champion.id);
    }

    return { suggestions, diagnosis };
  }

  /**
   * Diagnostic stratégique officiel rédigé avec le vocabulaire esport
   */
  private buildCoachDiagnosis(
    playerRole: LoLRole,
    directOpponent: LoLChampion | null,
    allyList: LoLChampion[],
    enemyList: LoLChampion[],
    compAnalysis: CompAnalysis,
    needsAp: boolean,
    needsFrontline: boolean
  ): CoachDraftDiagnosis {
    const missingNeeds: string[] = [];
    if (needsAp) missingNeeds.push("Manque critique de dégâts magiques (AP) : risque d'empilement d'Armure en face.");
    if (needsFrontline) missingNeeds.push("Absence de ligne de front (Frontline/Tank) : vulnérabilité aux engages directes.");
    if (compAnalysis.enemyThreats.heavyDive) missingNeeds.push("Forte menace de dive/assassinat : besoin de peeling ou de stuns ciblés.");
    if (compAnalysis.enemyThreats.heavyCc) missingNeeds.push("Gros contrôles ennemis (Hard CC) : Tenacité et positionnement rigoureux requis.");

    let verdict = "";
    if (directOpponent) {
      verdict = `L'adversaire a déjà verrouillé ${directOpponent.name} en ${buildEngine.getRoleLabelFr(playerRole)}. C'est une opportunité majeure de contre-pick direct pour dicter le tempo dès la phase de lane.`;
    } else {
      verdict = `L'adversaire n'a pas encore révélé son pick en ${buildEngine.getRoleLabelFr(playerRole)}. Priorisez un pick solide, autonome et impossible à punir lourdement (Blind-Pick S-Tier).`;
    }

    const damageAssessment = `Répartition Dégâts Ennemis : ${compAnalysis.enemyDamageSplit.adPercentage}% AD / ${compAnalysis.enemyDamageSplit.apPercentage}% AP. ${compAnalysis.suggestedFocus}`;
    const teamfightIdentity = compAnalysis.enemyThreats.heavyTank 
      ? "Plan de jeu : Front-to-Back avec priorité au shred de PV max."
      : compAnalysis.enemyThreats.heavyPoke 
      ? "Plan de jeu : Hard Engage rapide avant de subir le siège à distance."
      : "Plan de jeu : Escarmouches ordonnées et contrôle des objectifs neutres.";

    const priorityGamePlan = directOpponent 
      ? `Neutraliser le plan de jeu de ${directOpponent.name} et sécuriser les priorités de vague pour assister le Jungler.`
      : `Maintenir une phase de lane hermétique et sécuriser les spikes d'objets pour les regroupements Dragon/Baron.`;

    return {
      verdict,
      damageAssessment,
      missingNeeds,
      teamfightIdentity,
      priorityGamePlan
    };
  }

  /**
   * Recherche du contre-pick direct
   */
  private findBestCounterPick(
    pool: LoLChampion[],
    opponent: LoLChampion | null,
    enemies: LoLChampion[],
    chosen: Set<string>,
    compAnalysis: CompAnalysis,
    needsAp: boolean
  ): DraftSuggestion | null {
    // 1. Chercher dans la base tactique
    if (opponent) {
      for (const [id, data] of Object.entries(WORLDS_TACTICAL_KNOWLEDGE)) {
        if (!chosen.has(id) && data.counters.some(c => c.toLowerCase() === opponent.id.toLowerCase() || c.toLowerCase() === opponent.name.toLowerCase())) {
          const found = pool.find(c => c.id === id);
          if (found) {
            return {
              champion: found,
              score: 98,
              tier: 'S+',
              synergyType: 'COUNTER',
              reason: data.counterReason(opponent.name),
              winCondition: `Exploiter la supériorité de kit dès les premiers niveaux pour refuser le farm à ${opponent.name}.`,
              lanePhasePlan: data.lanePlan,
              teamfightRole: data.teamfightPlan,
              coachWarning: data.trapWarning,
              keyMatchupAdvantage: `Avantage net contre ${opponent.name}`
            };
          }
        }
      }
    }

    // 2. Recherche heuristique basée sur les menaces globales
    const targetEnemy = opponent || enemies[0];
    const candidate = pool.find(c => {
      if (chosen.has(c.id)) return false;
      if (needsAp && c.tags.includes('Mage')) return true;
      if (compAnalysis.enemyThreats.heavyTank && (c.id === 'Fiora' || c.id === 'Vayne' || c.id === 'Gwen' || c.id === 'Brand')) return true;
      if (compAnalysis.enemyThreats.heavyDive && (c.id === 'Poppy' || c.id === 'Lulu' || c.id === 'Thresh' || c.id === 'Malzahar')) return true;
      return false;
    }) || pool[0];

    if (!candidate) return null;

    const knowledge = WORLDS_TACTICAL_KNOWLEDGE[candidate.id];
    return {
      champion: candidate,
      score: 96,
      tier: 'S+',
      synergyType: 'COUNTER',
      reason: knowledge ? knowledge.counterReason(targetEnemy ? targetEnemy.name : "l'équipe ennemie") : `Contre directement le schéma de jeu adverse en annihilant leurs angles d'attaque majeurs.`,
      winCondition: "Prendre l'ascendant sur les duels et forcer l'adversaire à concéder les priorités de lane.",
      lanePhasePlan: knowledge?.lanePlan || "Gérer les vagues pour geler près de votre tourelle et forcer l'adversaire à s'exposer.",
      teamfightRole: knowledge?.teamfightPlan || "Verrouiller la cible prioritaire dès l'amorce du teamfight.",
      coachWarning: knowledge?.trapWarning || "Attention aux décalages ennemis si vous poussez la ligne trop agressivement."
    };
  }

  /**
   * Recherche de la meilleure synergie d'équipe 5v5
   */
  private findBestSynergyPick(
    pool: LoLChampion[],
    allies: LoLChampion[],
    chosen: Set<string>,
    needsAp: boolean,
    needsFrontline: boolean
  ): DraftSuggestion | null {
    // Chercher une synergie documentée avec un allié présent
    for (const ally of allies) {
      for (const [id, data] of Object.entries(WORLDS_TACTICAL_KNOWLEDGE)) {
        if (!chosen.has(id) && data.synergies.some(s => s.toLowerCase() === ally.id.toLowerCase() || s.toLowerCase() === ally.name.toLowerCase())) {
          const found = pool.find(c => c.id === id);
          if (found) {
            return {
              champion: found,
              score: 95,
              tier: 'S',
              synergyType: 'SYNERGY',
              reason: data.synergyReason(ally.name),
              winCondition: `Coordonner les sorts clés avec ${ally.name} pour des exécutions d'équipe irréprochables.`,
              lanePhasePlan: data.lanePlan,
              teamfightRole: data.teamfightPlan,
              coachWarning: data.trapWarning,
              keyMatchupAdvantage: `Combo garanti avec ${ally.name}`
            };
          }
        }
      }
    }

    // Heuristique sur les besoins de l'équipe
    const candidate = pool.find(c => {
      if (chosen.has(c.id)) return false;
      if (needsFrontline && c.tags.includes('Tank')) return true;
      if (needsAp && c.tags.includes('Mage')) return true;
      return c.tags.includes('Fighter') || c.tags.includes('Support');
    }) || pool.find(c => !chosen.has(c.id)) || pool[0];

    if (!candidate) return null;
    const allyName = allies[0]?.name || "votre équipe";
    const knowledge = WORLDS_TACTICAL_KNOWLEDGE[candidate.id];

    return {
      champion: candidate,
      score: 93,
      tier: 'S',
      synergyType: 'SYNERGY',
      reason: knowledge ? knowledge.synergyReason(allyName) : `Complète idéalement la composition en apportant le contrôle et le volume de dégâts manquant.`,
      winCondition: "Jouer groupé sur les combats de Dragon et d'Héraut pour rentabiliser le combo 5v5.",
      lanePhasePlan: knowledge?.lanePlan || "Stabiliser la lane et rejoindre rapidement les escarmouches d'objectifs.",
      teamfightRole: knowledge?.teamfightPlan || "Protéger les carrys fragiles ou initier sur le regroupement adverse.",
      coachWarning: knowledge?.trapWarning || "Ne restez pas isolé en fin de partie sans couverture de votre équipe."
    };
  }

  /**
   * Recherche du meilleur Blind-Pick S-Tier
   */
  private findBestBlindSafePick(
    pool: LoLChampion[],
    opponent: LoLChampion | null,
    chosen: Set<string>,
    needsAp: boolean
  ): DraftSuggestion | null {
    // Champions universellement réputés pour être des blind-picks sûrs en esport
    const blindChampionsOrder = [
      'Orianna', 'Ahri', 'Aatrox', 'Renekton', 'Sejuani', 'JarvanIV', 'Xayah', 'Thresh', 'Nautilus', 'Poppy', 'Syndra', 'Kaisa', 'Varus'
    ];

    let candidate: LoLChampion | undefined;
    for (const id of blindChampionsOrder) {
      if (!chosen.has(id)) {
        const found = pool.find(c => c.id === id);
        if (found) {
          candidate = found;
          break;
        }
      }
    }

    if (!candidate) {
      candidate = pool.find(c => !chosen.has(c.id)) || pool[0];
    }
    if (!candidate) return null;

    const knowledge = WORLDS_TACTICAL_KNOWLEDGE[candidate.id];
    return {
      champion: candidate,
      score: 94,
      tier: 'S',
      synergyType: 'BLIND_SAFE',
      reason: knowledge 
        ? `Pick d'une stabilité absolue avec kit complet (poke, survie, impact en teamfight) ne concédant aucun hard-counter fatal.`
        : `Choix inébranlable et autonome capable de neutraliser n'importe quel matchup sans être mis en difficulté.`,
      winCondition: "Obtenir une phase de lane neutre ou gagnante sans prendre de risques inconsidérés, puis dominer les teamfights.",
      lanePhasePlan: knowledge?.lanePlan || "Conserver la maîtrise des vagues et punir les erreurs d'engagement adverses.",
      teamfightRole: knowledge?.teamfightPlan || "Distribuer le maximum d'utilité et de dégâts à distance sécurisée.",
      coachWarning: knowledge?.trapWarning || "Ne sur-estimez pas votre avantage en début de partie face à des junglers à gank précoce."
    };
  }

  /**
   * Recherche du pick Cheese Exotique
   */
  private findBestCheesePick(
    pool: LoLChampion[],
    role: LoLRole,
    opponent: LoLChampion | null,
    chosen: Set<string>
  ): DraftSuggestion | null {
    const cheeseCatalogue: Record<LoLRole, { champId: string; hook: string; plan: string; warning: string }[]> = {
      TOP: [
        { champId: 'Vayne', hook: "Vayne Top Lame du Roi Déchu & Attaque Soutenue", plan: "Harcelez sans relâche le colosse adverse à chaque coup de sbire.", warning: "Cible numéro 1 du jungler adverse : placez des balises profondes." },
        { champId: 'Heimerdinger', hook: "Heimerdinger Tourelles de Siège Impénétrables", plan: "Posez vos 3 tourelles en triangle et absorbez les ganks en 1v2.", warning: "Inutile si l'adversaire parvient à détruire vos tourelles sans s'approcher." },
        { champId: 'Cassiopeia', hook: "Cassiopeia Miasme Anti-Dash & Rythme Explosif", plan: "Bloquez les dashs de mêlée au Miasme et mitraillez de Morsures jumelles.", warning: "Gestion du mana critique avant l'obtention de la Larme de la Déesse." },
      ],
      JUNGLE: [
        { champId: 'Brand', hook: "Brand Jungle Combustion Brûlure Pure", plan: "Clear ultra-rapide des camps multiples et carnage en teamfight au Baron.", warning: "Zéro mobilité : très sensible aux invades de début de partie." },
        { champId: 'Karthus', hook: "Karthus Jungle Moisson Noire & Requiem Global", plan: "Farmez en boucle et appuyez sur R dès qu'une lane enclenche un trade.", warning: "Vulnérable aux duellistes agressifs (Lee Sin, Xin Zhao) dans sa jungle." },
      ],
      MID: [
        { champId: 'Pantheon', hook: "Pantheon Mid Létalité & Saut Stellaire Global", plan: "Stun point-and-click au Z, burst instantané et décale niveau 6 sur les ailes.", warning: "Doit créer un avantage décisif avant la 20e minute." },
        { champId: 'Tristana', hook: "Tristana Mid Dévoreuse de Plaques et Tourelles", plan: "Posez la charge E sur le mid adverse et faites exploser la première tour avant 12 min.", warning: "Ne sautez pas en avant au Z sans avoir vision du jungler ennemi." },
      ],
      BOTTOM: [
        { champId: 'Swain', hook: "Swain Bot Incarnation Démoniaque Imbattable", plan: "Attirez avec le E, zappez au Z et devenez intuable sous ultime en 2v2.", warning: "Faible mobilité face aux compos d'artillerie à très longue portée." },
        { champId: 'Ziggs', hook: "Ziggs Bot Artillerie & Démolition Instantanée", plan: "Détruisez les tours à 25% PV avec le Z et poussez à distance maximale.", warning: "Attention aux supports à engage lourd (Nautilus, Blitzcrank)." },
      ],
      SUPPORT: [
        { champId: 'Poppy', hook: "Poppy Support Anti-Engage & Projection", plan: "Annulez 100% des sauts de l'ADC ou support adverse au Z et plaquez au mur.", warning: "Courte portée : attention aux pokes d'enchanteurs à distance." },
        { champId: 'Pantheon', hook: "Pantheon Support One-Shot Botlane", plan: "Combo Z + Attaque Soutenue + A renforcé pour exécuter l'ADC adverse dès le lvl 2.", warning: "Perd de sa superbe en fin de partie si vous ne prenez pas de kills tôt." },
      ]
    };

    const entries = cheeseCatalogue[role] || cheeseCatalogue['TOP'];
    for (const item of entries) {
      if (!chosen.has(item.champId)) {
        const found = pool.find(c => c.id === item.champId);
        if (found) {
          return {
            champion: found,
            score: 91,
            tier: 'A+',
            synergyType: 'EXOTIC_CHEESE',
            reason: `Choix inattendu créant un déséquilibre psychologique et tactique immédiat. L'adversaire n'aura aucun repère de matchup.`,
            winCondition: `Surprendre l'adversaire dès les premiers échanges pour snow-ball la partie de manière irréversible.`,
            lanePhasePlan: item.plan,
            teamfightRole: "Détourner l'attention et forcer les sorts défensifs adverses de façon chaotique.",
            coachWarning: item.warning,
            exoticBuildHook: item.hook
          };
        }
      }
    }

    return null;
  }

  private isCompetitiveFlex(champId: string, role: LoLRole): boolean {
    const flexMap: Record<LoLRole, string[]> = {
      TOP: ['Vayne', 'Cassiopeia', 'Heimerdinger', 'Gragas', 'Yasuo', 'Zac'],
      JUNGLE: ['Brand', 'Karthus', 'Sylas', 'Taliyah', 'Gragas', 'Morgana'],
      MID: ['Tristana', 'Pantheon', 'Sett', 'Lucian', 'Jayce', 'Swain'],
      BOTTOM: ['Swain', 'Ziggs', 'Yasuo', 'Seraphine', 'Karthus', 'Hwei'],
      SUPPORT: ['Poppy', 'Pantheon', 'Gragas', 'Maokai', 'Shen', 'Shaco', 'Velkoz']
    };
    return (flexMap[role] || []).includes(champId);
  }
}

export const coachEngine = new CoachEngine();
