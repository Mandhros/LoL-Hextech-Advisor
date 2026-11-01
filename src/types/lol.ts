/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LoLRole = 'TOP' | 'JUNGLE' | 'MID' | 'BOTTOM' | 'SUPPORT';

export type DamageType = 'AD' | 'AP' | 'HYBRID' | 'TRUE';

export interface ChampionSpell {
  id: string;
  key: 'Q' | 'W' | 'E' | 'R' | 'P';
  name: string;
  description: string;
  iconUrl: string;
  cooldown?: string;
  cost?: string;
  range?: string;
  ratios?: string;
}

export interface ChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeed: number;
  movespeed: number;
}

export interface LoLChampion {
  id: string;            // e.g. 'Aatrox', 'Yasuo'
  key: string;           // numeric id e.g. '266'
  name: string;          // Nom affiché e.g. 'Aatrox'
  title: string;         // 'l'Épée des Darkin'
  blurb?: string;
  roles: LoLRole[];
  tags: string[];        // ['Fighter', 'Tank']
  iconUrl: string;
  splashUrl: string;
  stats: ChampionStats;
  spells: ChampionSpell[];
}

export interface LoLItem {
  id: string;
  name: string;
  description: string;
  plainText?: string;
  gold: number;
  tags: string[];
  iconUrl: string;
  stats?: Record<string, string | number>;
  isBoots?: boolean;
  isStarter?: boolean;
}

export type RuneTreeKey = 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';

export interface RuneSelection {
  primaryTree: RuneTreeKey;
  primaryKeystone: {
    name: string;
    iconUrl: string;
    description: string;
  };
  primarySlots: {
    name: string;
    iconUrl: string;
    description: string;
  }[];
  secondaryTree: RuneTreeKey;
  secondarySlots: {
    name: string;
    iconUrl: string;
    description: string;
  }[];
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
}

export type BuildType = 
  | 'META'
  | 'COUNTER_SURVIVAL'
  | 'COUNTER_PLAYSTYLE'
  | 'EXOTIC_1'
  | 'EXOTIC_2';

export interface LoLBuild {
  id: string;
  type: BuildType;
  badgeLabel: string;
  title: string;
  tagline: string;
  description: string;
  winCondition: string;
  powerSpikes: string[];
  starterItems: LoLItem[];
  boots: LoLItem;
  coreItems: LoLItem[];        // 3 items majeurs
  lateItems: LoLItem[];        // 2 derniers items pour le Full Build 6 objets
  situationalItems: LoLItem[]; // 2 objets optionnels
  runes: RuneSelection;
  skillOrder: ('Q' | 'W' | 'E' | 'R')[]; // 18 éléments pour les niveaux 1 à 18
  geminiTips: {
    combo: string;
    synergyHook: string;
    warningTrap: string;
  };
  isAiGenerated?: boolean;
}

export interface DraftState {
  playerRole: LoLRole;
  playerChampion: LoLChampion | null;
  allies: Record<LoLRole, LoLChampion | null>;
  enemies: Record<LoLRole, LoLChampion | null>;
  bans: {
    blue: (LoLChampion | null)[]; // 5 bans alliés
    red: (LoLChampion | null)[];  // 5 bans ennemis
  };
}

export interface CompAnalysis {
  enemyDamageSplit: {
    adPercentage: number;
    apPercentage: number;
    truePercentage: number;
  };
  enemyThreats: {
    heavyCc: boolean;
    heavyPoke: boolean;
    heavyDive: boolean;
    heavyTank: boolean;
    assassinBursts: boolean;
  };
  allySynergies: string[];
  suggestedFocus: string;
}

export type CoachSuggestionType = 'COUNTER' | 'SYNERGY' | 'BLIND_SAFE' | 'EXOTIC_CHEESE';

export interface DraftSuggestion {
  champion: LoLChampion;
  score: number;
  tier?: 'S+' | 'S' | 'A+' | 'A';
  synergyType: CoachSuggestionType;
  reason: string;
  winCondition?: string;
  lanePhasePlan?: string;
  teamfightRole?: string;
  coachWarning?: string;
  exoticBuildHook?: string;
  keyMatchupAdvantage?: string;
  dpmMetrics?: ChampionDpmMetrics;
}

export interface CoachDraftDiagnosis {
  verdict: string;
  damageAssessment: string;
  missingNeeds: string[];
  teamfightIdentity: string;
  priorityGamePlan: string;
}

// === METRIQUES STYLE DPM.LOL ===
export type ScalingCurve = 'EARLY' | 'MID' | 'LATE' | 'HYPER' | 'BALANCED';

export interface ChampionDpmMetrics {
  championId: string;
  role: LoLRole;
  expectedDpm: number;          // Ex: 680 DPM
  gd15: number;                 // Différentiel d'or moyen à 15m (ex: +320 ou -180)
  csd15: number;                // Différentiel de sbires à 15m (ex: +8.5 ou -4.2)
  winrate: number;              // Taux de victoire général (ex: 51.4%)
  damageShare: number;          // % des dégâts de l'équipe (ex: 27.5%)
  earlyDominanceScore: number;  // 0 à 100 (capacité à dominer les 10 premières minutes)
  killPressureLv3: number;      // 0 à 100
  killPressureLv6: number;      // 0 à 100
  scalingProfile: ScalingCurve; // Profil de scaling
  powerSpikes: string[];        // Ex: ['Niv 3', 'Lame du Roi Déchu', 'Niv 11']
  keyStrengths: string[];       // Ex: ['Burst monocible', 'Priorité de vague rapide']
  counterMatchups: Record<string, number>; // ID champion ennemi -> delta winrate (+3.5% ou -4.8%)
}

export interface MatchupDpmComparison {
  playerChamp: LoLChampion;
  enemyChamp: LoLChampion;
  role: LoLRole;
  playerMetrics: ChampionDpmMetrics;
  enemyMetrics: ChampionDpmMetrics;
  deltaDpm: number;             // Différence de DPM projeté
  deltaGd15: number;            // Différence attendue d'or à 15m
  deltaCsd15: number;           // Différence attendue de creeps à 15m
  laneAdvantagePercent: number; // Avantage estimé en % (-50% à +50%)
  laneFavorite: 'PLAYER' | 'ENEMY' | 'EVEN';
  tacticalKey: string;          // Conseil de jeu clé en matchup
  dangerWindow: string;         // Fenêtre de danger adverse
  winCondition: string;         // Condition de victoire de lane
}

// === IN-GAME COMPANION & SECOND SCREEN STATE ===
export type SummonerSpellKey = 
  | 'FLASH' 
  | 'TELEPORT' 
  | 'IGNITE' 
  | 'CLEANSE' 
  | 'GHOST' 
  | 'EXHAUST' 
  | 'HEAL' 
  | 'BARRIER' 
  | 'SMITE';

export interface SummonerSpellData {
  key: SummonerSpellKey;
  name: string;
  baseCooldown: number; // en secondes
  iconUrl: string;
}

export interface SummonerSpellTimer {
  id: string; // ex: 'TOP_spell1'
  spellKey: SummonerSpellKey;
  role: LoLRole;
  enemyChampionId: string;
  baseCooldown: number;
  hasLucidityBoots: boolean;  // -12 Haste invocateur
  hasCosmicInsight: boolean;  // -18 Haste invocateur
  currentCooldown: number;    // Temps total calculé
  endsAtGameSec: number | null; // Heure de jeu (en sec) où le sort revient
  remainingSec: number;       // Temps restant
  isActive: boolean;          // true = en recharge
}

export type NeutralObjectiveKey = 'VOIDGRUBS' | 'HERALD' | 'DRAGON' | 'BARON' | 'ELDER';

export interface ObjectiveTimer {
  key: NeutralObjectiveKey;
  name: string;
  spawnTimeSec: number;       // Première apparition (ex: 300 pour 5:00)
  respawnTimeSec: number;     // Délai de réapparition (ex: 300 pour Dragon)
  despawnTimeSec?: number;    // Heure de disparition (ex: 830 pour Héraut)
  nextSpawnSec: number;       // Prochain spawn en heure de jeu
  isAlive: boolean;           // Actuellement présent sur la carte
  iconUrl: string;
  tacticalNote: string;
}

export interface InGameMatchState {
  gameTimeSec: number;        // Horloge de la partie en secondes
  isRunning: boolean;
  gameMode: 'MANUAL' | 'LIVE_API_SYNC';
  summonerTimers: Record<string, SummonerSpellTimer>;
  objectives: Record<NeutralObjectiveKey, ObjectiveTimer>;
  playerRole: LoLRole;
  playerChampion: LoLChampion | null;
  enemyChampion: LoLChampion | null;
  adaptiveItemNotes: string[];
}

