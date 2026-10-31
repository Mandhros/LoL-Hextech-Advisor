/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLChampion, LoLBuild, DraftState, CompAnalysis, LoLItem, LoLRole } from '../types/lol';
import { riotDataService } from './riotDataService';
import { RUNE_TREES_META, DEFAULT_SHARDS } from '../data/starterRunes';
import { CHAMPION_THEORIES, generateDynamicExoticTheory } from '../data/championTheories';

export class BuildEngine {
  /**
   * Analyse la composition adverse et alliée
   */
  analyzeComp(draft: DraftState): CompAnalysis {
    const enemyChamps = Object.values(draft.enemies).filter(Boolean) as LoLChampion[];
    
    let adCount = 0;
    let apCount = 0;
    let ccScore = 0;
    let tankCount = 0;
    let assassinCount = 0;
    let pokeCount = 0;

    for (const champ of enemyChamps) {
      if (champ.tags.includes('Marksman') || champ.tags.includes('Fighter')) {
        adCount += 1.5;
      }
      if (champ.tags.includes('Mage')) {
        apCount += 1.5;
      }
      if (champ.tags.includes('Tank')) {
        tankCount++;
        ccScore += 2;
      }
      if (champ.tags.includes('Assassin')) {
        assassinCount++;
        adCount += 0.5;
      }
      if (['Jinx', 'Ezreal', 'Ahri', 'Jhin', 'Zac'].includes(champ.id)) {
        pokeCount++;
      }
      if (['Nautilus', 'Thresh', 'Malphite', 'Zac', 'Leona'].includes(champ.id)) {
        ccScore += 2;
      }
    }

    const totalDmgScore = Math.max(1, adCount + apCount);
    const adPct = Math.round((adCount / totalDmgScore) * 100);
    const apPct = 100 - adPct;

    return {
      enemyDamageSplit: {
        adPercentage: adPct,
        apPercentage: apPct,
        truePercentage: 5,
      },
      enemyThreats: {
        heavyCc: ccScore >= 4,
        heavyPoke: pokeCount >= 2,
        heavyDive: assassinCount >= 2,
        heavyTank: tankCount >= 2,
        assassinBursts: assassinCount >= 1,
      },
      allySynergies: [
        'Engage groupé en teamfight',
        'Contrôle d\'objectifs Neutres (Dragon / Baron)',
        'Potentiel de pick & catch sur cible isolée'
      ],
      suggestedFocus: tankCount >= 2 
        ? "Priorité Pénétration d'Armure / Pourcentage PV Max face aux sacs à PV adverses."
        : adPct >= 65 
        ? "L'ennemi est majoritairement AD : privilégier l'Armure, Coques en Acier et Réduction d'Auto-Attaques."
        : apPct >= 65 
        ? "L'ennemi a un fort burst magique AP : prioriser Rookern Kaénique et Sandales de Mercure."
        : "Composition équilibrée : respecter le pic de puissance Core Items du champion."
    };
  }

  /**
  /**
   * Helper pour obtenir le nom lisible de la lane en français
   */
  getRoleLabelFr(role: LoLRole): string {
    switch (role) {
      case 'TOP': return 'Toplane';
      case 'JUNGLE': return 'Jungle';
      case 'MID': return 'Midlane';
      case 'BOTTOM': return 'Botlane / ADC';
      case 'SUPPORT': return 'Support';
      default: return role;
    }
  }

  /**
   * Génère les 3 premiers builds déterministes (Build 1: Méta pure, Build 2: Orienté défense, Build 3: Orienté offensif)
   * strictement adaptés à la lane / au rôle choisi
   */
  generateAlgorithmicBuilds(champion: LoLChampion, draft: DraftState, role?: LoLRole): LoLBuild[] {
    const effectiveRole = role || draft.playerRole || 'TOP';
    const analysis = this.analyzeComp(draft);
    const isMage = champion.tags.includes('Mage');
    const isTank = champion.tags.includes('Tank');
    const isMarksman = champion.tags.includes('Marksman');
    const isFighter = champion.tags.includes('Fighter');
    const isAssassin = champion.tags.includes('Assassin');

    // BUILD 1 : MÉTA PURE
    const metaBuild = this.createMetaBuild(champion, effectiveRole, isMage, isTank, isMarksman, isFighter, isAssassin);

    // BUILD 2 : ORIENTÉ DÉFENSE
    const counterDefBuild = this.createCounterDefBuild(champion, effectiveRole, analysis, isMage, isTank, isMarksman, isFighter);

    // BUILD 3 : ORIENTÉ OFFENSIF
    const playstyleBuild = this.createPlaystyleBuild(champion, effectiveRole, analysis, isMage, isTank, isMarksman, isFighter);

    return [metaBuild, counterDefBuild, playstyleBuild];
  }

  private createMetaBuild(
    champ: LoLChampion,
    role: LoLRole,
    isMage: boolean,
    isTank: boolean,
    isMarksman: boolean,
    isFighter: boolean,
    isAssassin: boolean
  ): LoLBuild {
    const roleLabel = this.getRoleLabelFr(role);
    let starter = riotDataService.getItemById('1055')!; // Doran Blade par défaut
    let boots = riotDataService.getItemById('3047')!;   // Steelcaps
    let core: LoLItem[] = [];
    let late: LoLItem[] = [];
    let sit: LoLItem[] = [];
    let tree = RUNE_TREES_META.Precision;
    let keystone = tree.keystones[0]; // Conqueror
    let secondaryTree = RUNE_TREES_META.Resolve;

    // Adaptation du starter selon la lane / rôle
    if (role === 'SUPPORT') {
      starter = riotDataService.getItemById('3865') || riotDataService.getItemById('world_atlas') || riotDataService.getItemById('1054')!;
    } else if (role === 'JUNGLE') {
      starter = riotDataService.getItemById('1101') || riotDataService.getItemById('1102') || riotDataService.getItemById('1055')!;
    } else if (isTank || role === 'TOP') {
      starter = isTank ? riotDataService.getItemById('1054')! : riotDataService.getItemById('1055')!;
    } else if (isMage || role === 'MID') {
      starter = isMage ? riotDataService.getItemById('1056')! : riotDataService.getItemById('1055')!;
    } else if (role === 'BOTTOM' || isMarksman) {
      starter = riotDataService.getItemById('1055')!;
    }

    if (role === 'SUPPORT') {
      boots = isTank ? riotDataService.getItemById('3047')! : riotDataService.getItemById('3158')!;
      core = isTank
        ? [
            riotDataService.getItemById('3869') || riotDataService.getItemById('3190')!, // Bloodsong / Solari
            riotDataService.getItemById('3190')!, // Locket
            riotDataService.getItemById('3107') || riotDataService.getItemById('3075')!, // Redemption / Thornmail
          ]
        : [
            riotDataService.getItemById('3869')!, // Bloodsong
            riotDataService.getItemById('3190')!, // Locket
            riotDataService.getItemById('3107')!, // Redemption
          ];
      late = [
        riotDataService.getItemById('3110')!, // Frozen Heart
        riotDataService.getItemById('6664')!, // Kaenic Rookern
      ];
      sit = [
        riotDataService.getItemById('3075')!,
        riotDataService.getItemById('3157')!,
      ];
      tree = isTank ? RUNE_TREES_META.Resolve : RUNE_TREES_META.Inspiration;
      keystone = isTank ? tree.keystones[1] || tree.keystones[0] : tree.keystones[0];
      secondaryTree = RUNE_TREES_META.Resolve;
    } else if (isMarksman || role === 'BOTTOM') {
      boots = riotDataService.getItemById('3006')!; // Berserker
      core = [
        riotDataService.getItemById('6672')!, // Kraken Slayer
        riotDataService.getItemById('3031')!, // Infinity Edge
        riotDataService.getItemById('3036')!, // LDR
      ];
      late = [
        riotDataService.getItemById('3072') || riotDataService.getItemById('6676')!, // Bloodthirster
        riotDataService.getItemById('3026')!, // Guardian Angel
      ];
      sit = [
        riotDataService.getItemById('6676')!, // Collector
        riotDataService.getItemById('3046')!, // Phantom Dancer
      ];
      tree = RUNE_TREES_META.Precision;
      keystone = tree.keystones[1]; // PTA
      secondaryTree = RUNE_TREES_META.Inspiration;
    } else if (isMage || role === 'MID') {
      boots = riotDataService.getItemById('3020')!; // Sorcerer Shoes
      core = [
        riotDataService.getItemById('6655')!, // Luden
        riotDataService.getItemById('4645')!, // Shadowflame
        riotDataService.getItemById('3089')!, // Rabadon
      ];
      late = [
        riotDataService.getItemById('3135')!, // Void Staff
        riotDataService.getItemById('3157')!, // Zhonya
      ];
      sit = [
        riotDataService.getItemById('3151')!, // Liandry
        riotDataService.getItemById('3102')!, // Banshee
      ];
      tree = RUNE_TREES_META.Sorcery;
      keystone = tree.keystones[0]; // Arcane Comet
      secondaryTree = RUNE_TREES_META.Inspiration;
    } else if (isTank) {
      boots = riotDataService.getItemById('3047')!;
      core = [
        riotDataService.getItemById('3084')!, // Heartsteel
        riotDataService.getItemById('3068')!, // Sunfire
        riotDataService.getItemById('6665')!, // Jak'Sho
      ];
      late = [
        riotDataService.getItemById('3075')!, // Thornmail
        riotDataService.getItemById('6664')!, // Kaenic Rookern
      ];
      sit = [
        riotDataService.getItemById('3143')!, // Randuin
        riotDataService.getItemById('3083')!, // Warmog
      ];
      tree = RUNE_TREES_META.Resolve;
      keystone = tree.keystones[0]; // Grasp
      secondaryTree = RUNE_TREES_META.Precision;
    } else {
      // Bruiser / Fighter / Assassin (Top ou Jungle)
      boots = role === 'JUNGLE' ? riotDataService.getItemById('3158') || riotDataService.getItemById('3047')! : riotDataService.getItemById('3047')!;
      core = [
        riotDataService.getItemById('6610')!, // Sundered Sky
        riotDataService.getItemById('3078')!, // Trinity Force
        riotDataService.getItemById('3053')!, // Sterak's Gage
      ];
      late = [
        riotDataService.getItemById('6333')!, // Death's Dance
        riotDataService.getItemById('3026')!, // Guardian Angel
      ];
      sit = [
        riotDataService.getItemById('3071')!, // Black Cleaver
        riotDataService.getItemById('3156')!, // Maw of Malmortius
      ];
      tree = RUNE_TREES_META.Precision;
      keystone = tree.keystones[0]; // Conqueror
      secondaryTree = RUNE_TREES_META.Resolve;
    }

    const theory = CHAMPION_THEORIES[champ.name] || CHAMPION_THEORIES[champ.id] || generateDynamicExoticTheory(champ.name, role, champ.tags, champ.stats);

    return {
      id: `${champ.id}-meta`,
      type: 'META',
      badgeLabel: 'BUILD 1 : MÉTA PURE',
      title: `Méta Pure - ${champ.name} (${roleLabel})`,
      tagline: `Le build avec le taux de victoire le plus régulier en ${roleLabel} sur le patch actuel.`,
      description: `Ce build exploite la courbe de montée en puissance naturelle de ${champ.name} optimisée pour la ${roleLabel}. Il offre le parfait équilibre de statistiques requis pour dominer la phase de lane et impacter les escarmouches d'objectifs jusqu'au Full Build 6 objets.`,
      winCondition: `Atteindre le pic de puissance 2-3 items et clore la partie sur le Full Build 6 objets en impactant la ${roleLabel}.`,
      powerSpikes: ['Niveau 6 (Ultime)', '1er Objet Complété (Power Spike majeur)', 'Full Build 6 Objets (Fin de partie)'],
      starterItems: [starter],
      boots: boots,
      coreItems: core.filter(Boolean),
      lateItems: late.filter(Boolean),
      situationalItems: sit.filter(Boolean),
      runes: {
        primaryTree: tree.name === 'Précision' ? 'Precision' : tree.name === 'Sorcellerie' ? 'Sorcery' : 'Resolve',
        primaryKeystone: keystone,
        primarySlots: tree.slots.slice(0, 3),
        secondaryTree: secondaryTree.name === 'Volonté' ? 'Resolve' : 'Inspiration',
        secondarySlots: secondaryTree.slots.slice(0, 2),
        shards: DEFAULT_SHARDS,
      },
      skillOrder: ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W'],
      geminiTips: {
        combo: theory.metaCombo,
        synergyHook: `${theory.metaSynergy} (Optimisé pour la position ${roleLabel}).`,
        warningTrap: theory.metaWarning,
      }
    };
  }

  private createCounterDefBuild(
    champ: LoLChampion,
    role: LoLRole,
    analysis: CompAnalysis,
    isMage: boolean,
    isTank: boolean,
    isMarksman: boolean,
    isFighter: boolean
  ): LoLBuild {
    const roleLabel = this.getRoleLabelFr(role);
    const theory = CHAMPION_THEORIES[champ.name] || CHAMPION_THEORIES[champ.id] || generateDynamicExoticTheory(champ.name, role, champ.tags, champ.stats);
    const isEnemyHeavyAd = analysis.enemyDamageSplit.adPercentage >= 60;
    const isEnemyHeavyCc = analysis.enemyThreats.heavyCc;

    const boots = (isEnemyHeavyCc || !isEnemyHeavyAd) 
      ? riotDataService.getItemById('3111')! // Mercury Treads
      : riotDataService.getItemById('3047')!; // Plated Steelcaps

    let starter = riotDataService.getItemById('1054')!;
    if (role === 'SUPPORT') {
      starter = riotDataService.getItemById('3865') || riotDataService.getItemById('1054')!;
    } else if (role === 'JUNGLE') {
      starter = riotDataService.getItemById('1102') || riotDataService.getItemById('1101')!;
    }

    let core: LoLItem[] = [];
    let late: LoLItem[] = [];
    let sit: LoLItem[] = [];

    if (role === 'SUPPORT') {
      core = [
        riotDataService.getItemById('3869') || riotDataService.getItemById('3190')!,
        riotDataService.getItemById('3190')!, // Locket
        riotDataService.getItemById('3107')!, // Redemption
      ];
      late = [
        riotDataService.getItemById('3110')!, // Frozen Heart
        riotDataService.getItemById('6664')!, // Kaenic Rookern
      ];
      sit = [
        riotDataService.getItemById('3075')!, // Thornmail
        riotDataService.getItemById('4401')!, // FoN
      ];
    } else if (isEnemyHeavyAd) {
      core = [
        riotDataService.getItemById('6610') || riotDataService.getItemById('3068')!,
        riotDataService.getItemById('6333') || riotDataService.getItemById('3075')!, // Death Dance / Thornmail
        riotDataService.getItemById('3053') || riotDataService.getItemById('3143')!, // Sterak / Randuin
      ];
      late = [
        riotDataService.getItemById('3110')!, // Frozen Heart
        riotDataService.getItemById('3026') || riotDataService.getItemById('3143')!, // GA or Randuin
      ];
      sit = [
        riotDataService.getItemById('3075')!, // Thornmail
        riotDataService.getItemById('3083')!, // Warmog
      ];
    } else {
      core = [
        riotDataService.getItemById('6664')!, // Kaenic Rookern
        riotDataService.getItemById('3053') || riotDataService.getItemById('4633')!, // Sterak or Riftmaker
        riotDataService.getItemById('4401') || riotDataService.getItemById('6665')!, // FoN or Jak'Sho
      ];
      late = [
        riotDataService.getItemById('3156') || riotDataService.getItemById('3102')!, // Maw or Banshee
        riotDataService.getItemById('3026') || riotDataService.getItemById('3157')!, // GA or Zhonya
      ];
      sit = [
        riotDataService.getItemById('3157') || riotDataService.getItemById('3071')!,
        riotDataService.getItemById('6665')!,
      ];
    }

    return {
      id: `${champ.id}-counter-def`,
      type: 'COUNTER_SURVIVAL',
      badgeLabel: 'BUILD 2 : ORIENTÉ DÉFENSE',
      title: `Rempart Défensif & Survie (${champ.name})`,
      tagline: `Spécifiquement conçu pour anéantir la comp adverse (${analysis.enemyDamageSplit.adPercentage}% AD / ${analysis.enemyDamageSplit.apPercentage}% AP) sur la ${roleLabel}.`,
      description: `Ce build neutralise complètement la principale source de dégâts ennemie. Vous absorbez le burst adverse sans trembler pour assurer les escarmouches de votre lane et protéger vos carrys jusqu'au 6-items complet.`,
      winCondition: `Servir d'éponge à dégâts sur l'engage adverse et sécuriser les escarmouches en ${roleLabel}.`,
      powerSpikes: ['Achat des Bottes Défensives', 'Second objet de résistance majeure', 'Full Build 6 Objets Colossal'],
      starterItems: [starter],
      boots: boots,
      coreItems: core.filter(Boolean),
      lateItems: late.filter(Boolean),
      situationalItems: sit.filter(Boolean),
      runes: {
        primaryTree: 'Resolve',
        primaryKeystone: RUNE_TREES_META.Resolve.keystones[0], // Grasp
        primarySlots: [
          RUNE_TREES_META.Resolve.slots[1], // Second Wind
          RUNE_TREES_META.Resolve.slots[2], // Bone Plating
          RUNE_TREES_META.Resolve.slots[4], // Unflinching
        ],
        secondaryTree: 'Precision',
        secondarySlots: [
          RUNE_TREES_META.Precision.slots[0], // Triumph
          RUNE_TREES_META.Precision.slots[5], // Last Stand
        ],
        shards: {
          offense: '+9 Force Adaptative',
          flex: '+6 Armure ou +8 Résistance Magique',
          defense: '+65 PV de base (+10-180 PV selon le niveau)'
        }
      },
      skillOrder: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E', 'R', 'E', 'E'],
      geminiTips: {
        combo: theory.defenseCombo,
        synergyHook: `${theory.metaSynergy} (Tenue de combat défensive sur la ${roleLabel}).`,
        warningTrap: theory.metaWarning,
      }
    };
  }

  private createPlaystyleBuild(
    champ: LoLChampion,
    role: LoLRole,
    analysis: CompAnalysis,
    isMage: boolean,
    isTank: boolean,
    isMarksman: boolean,
    isFighter: boolean
  ): LoLBuild {
    const roleLabel = this.getRoleLabelFr(role);
    const theory = CHAMPION_THEORIES[champ.name] || CHAMPION_THEORIES[champ.id] || generateDynamicExoticTheory(champ.name, role, champ.tags, champ.stats);

    let title = `Domination & Burst Offensif (${champ.name})`;
    let tagline = `Hyper-agressivité et prise d'initiative maximale pour écraser la ${roleLabel}.`;
    
    let starter = riotDataService.getItemById('1055')!;
    if (role === 'SUPPORT') {
      starter = riotDataService.getItemById('3865') || riotDataService.getItemById('1055')!;
    } else if (role === 'JUNGLE') {
      starter = riotDataService.getItemById('1101') || riotDataService.getItemById('1102')!;
    } else if (isMage || role === 'MID') {
      starter = riotDataService.getItemById('1056') || riotDataService.getItemById('1082')!;
    }

    let core = [
      riotDataService.getItemById('3078')!, // Trinity
      riotDataService.getItemById('3153')!, // BotRK
      riotDataService.getItemById('3071')!, // Black Cleaver
    ];
    let late = [
      riotDataService.getItemById('6333')!, // Death's Dance
      riotDataService.getItemById('3026')!, // Guardian Angel
    ];
    let sit = [
      riotDataService.getItemById('6692')!, // Eclipse
      riotDataService.getItemById('3053')!, // Sterak
    ];
    let boots = riotDataService.getItemById('3006') || riotDataService.getItemById('3047')!;

    if (isMage || role === 'MID') {
      title = `Burst & Pénétration Magique Pure (${champ.name})`;
      tagline = `Déchiquette les barres de PV avec Tourment de Liandry, Flamme-Ombre et Rabadon.`;
      core = [
        riotDataService.getItemById('3151') || riotDataService.getItemById('6655')!, // Liandry / Luden
        riotDataService.getItemById('4645')!, // Shadowflame
        riotDataService.getItemById('3135')!, // Void Staff
      ];
      late = [
        riotDataService.getItemById('3089')!, // Rabadon
        riotDataService.getItemById('3157')!, // Zhonya
      ];
      sit = [
        riotDataService.getItemById('4629')!, // Cosmic Drive
        riotDataService.getItemById('3102')!, // Banshee
      ];
      boots = riotDataService.getItemById('3020')!;
    } else if (role === 'SUPPORT') {
      title = `Support Offensif & Menace de Kill (${champ.name})`;
      tagline = `Pression létale en 2v2 pour forcer des flashs et snowball la botlane.`;
      core = [
        riotDataService.getItemById('3869')!, // Chant de sang
        riotDataService.getItemById('6692') || riotDataService.getItemById('3151')!, // Eclipse / Liandry
        riotDataService.getItemById('3071') || riotDataService.getItemById('4645')!, // Cleaver / Shadowflame
      ];
      late = [
        riotDataService.getItemById('3026') || riotDataService.getItemById('3157')!, // GA / Zhonya
        riotDataService.getItemById('6333') || riotDataService.getItemById('3089')!,
      ];
      sit = [
        riotDataService.getItemById('3190')!,
        riotDataService.getItemById('3075')!,
      ];
    }

    return {
      id: `${champ.id}-playstyle-offensive`,
      type: 'COUNTER_PLAYSTYLE',
      badgeLabel: 'BUILD 3 : ORIENTÉ OFFENSIF',
      title,
      tagline,
      description: `Orienté sur l'hyper-agressivité, le kill potential et la prise d'initiative en ${roleLabel}. Ce build maximise le burst et l'accélération d'élimination pour forcer l'ennemi en position défensive.`,
      winCondition: `Gagner chaque duel en ${roleLabel}, créer un différentiel de ressources et punir chaque erreur de positionnement adverse.`,
      powerSpikes: ['Fin du premier item offensif', 'Niveau 11 (Deuxième rang d\'Ultime)', 'Full Build 6 Objets de Carnage'],
      starterItems: [starter],
      boots,
      coreItems: core.filter(Boolean),
      lateItems: late.filter(Boolean),
      situationalItems: sit.filter(Boolean),
      runes: {
        primaryTree: 'Precision',
        primaryKeystone: RUNE_TREES_META.Precision.keystones[0], // Conqueror
        primarySlots: [
          RUNE_TREES_META.Precision.slots[0], // Triumph
          RUNE_TREES_META.Precision.slots[2], // Alacrity
          RUNE_TREES_META.Precision.slots[4], // Coup de grâce
        ],
        secondaryTree: 'Domination',
        secondarySlots: [
          RUNE_TREES_META.Domination.slots[0], // Sudden Impact
          RUNE_TREES_META.Domination.slots[3], // Relentless Hunter
        ],
        shards: DEFAULT_SHARDS,
      },
      skillOrder: ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W'],
      geminiTips: {
        combo: theory.offensiveCombo,
        synergyHook: `${theory.metaSynergy} (Prise d'initiative en ${roleLabel}).`,
        warningTrap: theory.metaWarning,
      }
    };
  }

  /**
   * Builds Exotiques Viables spécifiques à chaque champion et chaque lane
   */
  getFallbackExoticBuilds(champion: LoLChampion, role?: LoLRole): LoLBuild[] {
    const effectiveRole = role || 'TOP';
    const roleLabel = this.getRoleLabelFr(effectiveRole);
    const theory = CHAMPION_THEORIES[champion.name] || CHAMPION_THEORIES[champion.id] || generateDynamicExoticTheory(champion.name, effectiveRole, champion.tags, champion.stats);

    let starter1 = riotDataService.getItemById('1083') || riotDataService.getItemById('1055')!;
    let starter2 = riotDataService.getItemById('1054')!;

    if (effectiveRole === 'SUPPORT') {
      starter1 = riotDataService.getItemById('3865') || starter1;
      starter2 = riotDataService.getItemById('3865') || starter2;
    } else if (effectiveRole === 'JUNGLE') {
      starter1 = riotDataService.getItemById('1101') || starter1;
      starter2 = riotDataService.getItemById('1102') || starter2;
    }

    const t1 = theory.exoticViable;
    const core1 = t1.coreItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const late1 = t1.lateItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const sit1 = t1.situationalItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const tree1 = RUNE_TREES_META[t1.primaryTree] || RUNE_TREES_META.Domination;
    const keystone1 = tree1.keystones[t1.primaryKeystoneIndex] || tree1.keystones[0];
    const secTree1 = t1.primaryTree === 'Precision' ? RUNE_TREES_META.Resolve : RUNE_TREES_META.Precision;

    const t2 = theory.signatureCheese;
    const core2 = t2.coreItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const late2 = t2.lateItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const sit2 = t2.situationalItemIds.map(id => riotDataService.getItemById(id)).filter(Boolean) as LoLItem[];
    const tree2 = RUNE_TREES_META[t2.primaryTree] || RUNE_TREES_META.Inspiration;
    const keystone2 = tree2.keystones[t2.primaryKeystoneIndex] || tree2.keystones[0];
    const secTree2 = t2.primaryTree === 'Resolve' ? RUNE_TREES_META.Precision : RUNE_TREES_META.Resolve;

    const exotic1: LoLBuild = {
      id: `${champion.id}-exotic-1`,
      type: 'EXOTIC_1',
      badgeLabel: 'BUILD 4 : EXOTIQUE VIABLE',
      title: `${t1.title} (${roleLabel})`,
      tagline: t1.tagline,
      description: t1.description,
      winCondition: t1.winCondition,
      powerSpikes: t1.powerSpikes,
      starterItems: [starter1],
      boots: t1.primaryTree === 'Sorcery' ? riotDataService.getItemById('3020')! : riotDataService.getItemById('3006') || riotDataService.getItemById('3047')!,
      coreItems: core1.length >= 2 ? core1 : [riotDataService.getItemById('3078')!, riotDataService.getItemById('3153')!],
      lateItems: late1.length >= 2 ? late1 : [riotDataService.getItemById('6665')!, riotDataService.getItemById('3026')!],
      situationalItems: sit1.length >= 1 ? sit1 : [riotDataService.getItemById('3157')!],
      runes: {
        primaryTree: t1.primaryTree,
        primaryKeystone: keystone1,
        primarySlots: tree1.slots.slice(0, 3),
        secondaryTree: secTree1.name === 'Précision' ? 'Precision' : 'Resolve',
        secondarySlots: secTree1.slots.slice(0, 2),
        shards: DEFAULT_SHARDS,
      },
      skillOrder: ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W'],
      geminiTips: {
        combo: t1.comboTip,
        synergyHook: t1.synergyHook,
        warningTrap: t1.warningTrap,
      },
      isAiGenerated: false,
    };

    const exotic2: LoLBuild = {
      id: `${champion.id}-exotic-2`,
      type: 'EXOTIC_2',
      badgeLabel: 'BUILD 5 : SIGNATURE CHEESE',
      title: `${t2.title} (${roleLabel})`,
      tagline: t2.tagline,
      description: t2.description,
      winCondition: t2.winCondition,
      powerSpikes: t2.powerSpikes,
      starterItems: [starter2],
      boots: riotDataService.getItemById('3009') || riotDataService.getItemById('3047')!,
      coreItems: core2.length >= 2 ? core2 : [riotDataService.getItemById('3084')!, riotDataService.getItemById('3068')!],
      lateItems: late2.length >= 2 ? late2 : [riotDataService.getItemById('6665')!, riotDataService.getItemById('3075')!],
      situationalItems: sit2.length >= 1 ? sit2 : [riotDataService.getItemById('6664')!],
      runes: {
        primaryTree: t2.primaryTree,
        primaryKeystone: keystone2,
        primarySlots: tree2.slots.slice(0, 3),
        secondaryTree: secTree2.name === 'Précision' ? 'Precision' : 'Resolve',
        secondarySlots: secTree2.slots.slice(0, 2),
        shards: DEFAULT_SHARDS,
      },
      skillOrder: ['W', 'Q', 'E', 'W', 'W', 'R', 'W', 'Q', 'W', 'Q', 'R', 'Q', 'Q', 'E', 'E', 'R', 'E', 'E'],
      geminiTips: {
        combo: t2.comboTip,
        synergyHook: t2.synergyHook,
        warningTrap: t2.warningTrap,
      },
      isAiGenerated: false,
    };

    return [exotic1, exotic2];
  }
}

export const buildEngine = new BuildEngine();
