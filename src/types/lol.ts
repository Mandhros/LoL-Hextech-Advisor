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
}

export interface CoachDraftDiagnosis {
  verdict: string;
  damageAssessment: string;
  missingNeeds: string[];
  teamfightIdentity: string;
  priorityGamePlan: string;
}

