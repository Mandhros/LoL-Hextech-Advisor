/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChampionDpmMetrics, LoLRole, MatchupDpmComparison, LoLChampion } from '../types/lol';

/**
 * Matrice statistique de référence inspirée de DPM.LOL
 * Regroupe les indicateurs de performance clés (DPM, GD@15, CSD@15, Kill Pressure, Scaling)
 */
export const DPM_DATABASE: Record<string, Partial<Record<LoLRole, ChampionDpmMetrics>>> = {
  // === TOP ===
  Aatrox: {
    TOP: {
      championId: 'Aatrox',
      role: 'TOP',
      expectedDpm: 645,
      gd15: 220,
      csd15: 6.4,
      winrate: 50.8,
      damageShare: 24.5,
      earlyDominanceScore: 82,
      killPressureLv3: 78,
      killPressureLv6: 89,
      scalingProfile: 'MID',
      powerSpikes: ['Niv 3 (A1+A2+Z)', 'Ciel Éventré (1er Item)', 'Niv 9 (A au max)'],
      keyStrengths: ['Sustain en combat', 'Contrôles de zone répétables', 'Reset de vitesse sous R'],
      counterMatchups: {
        Sion: 4.8,
        Chogath: 4.2,
        Malphite: 3.5,
        Fiora: -4.1,
        Irelia: -3.8,
        Kled: 2.9,
      }
    }
  },
  Fiora: {
    TOP: {
      championId: 'Fiora',
      role: 'TOP',
      expectedDpm: 590,
      gd15: 380,
      csd15: 11.2,
      winrate: 51.5,
      damageShare: 22.0,
      earlyDominanceScore: 85,
      killPressureLv3: 82,
      killPressureLv6: 94,
      scalingProfile: 'HYPER',
      powerSpikes: ['Niv 2 (A + Z)', 'Hydre Vorace (Push + Dégâts)', 'Niv 11 (R Niv 2)'],
      keyStrengths: ['Dégâts bruts % PV max', 'Riposte Z annule les CC clés', 'Duelliste 1v1 imbattable'],
      counterMatchups: {
        Aatrox: 4.1,
        Ornn: 5.4,
        Chogath: 5.1,
        Poppy: -5.2,
        Malphite: -3.6,
      }
    }
  },
  Darius: {
    TOP: {
      championId: 'Darius',
      role: 'TOP',
      expectedDpm: 580,
      gd15: 450,
      csd15: 12.8,
      winrate: 51.2,
      damageShare: 21.8,
      earlyDominanceScore: 94,
      killPressureLv3: 92,
      killPressureLv6: 96,
      scalingProfile: 'EARLY',
      powerSpikes: ['Niv 1 (5 stacks passif)', 'Niv 3 (Ghost all-in)', 'Estropieur (Slow actif)'],
      keyStrengths: ['Snowball destructeur en lane', 'Dégâts bruts exécutifs sous R', 'Zone de frayeur 5 stacks'],
      counterMatchups: {
        Sion: 6.2,
        Nasus: 5.8,
        Chogath: 5.1,
        Vayne: -7.4,
        Quinn: -6.8,
        Gnar: -4.2,
      }
    }
  },
  Gwen: {
    TOP: {
      championId: 'Gwen',
      role: 'TOP',
      expectedDpm: 675,
      gd15: -80,
      csd15: -2.1,
      winrate: 50.2,
      damageShare: 26.2,
      earlyDominanceScore: 62,
      killPressureLv3: 58,
      killPressureLv6: 84,
      scalingProfile: 'LATE',
      powerSpikes: ['Dent de Nashor', 'Niv 11', 'Créateur de Failles (Dégâts bruts)'],
      keyStrengths: ['Découpe les tanks et résistances', 'Brume Z inciblable à distance', 'Hyper-carry AP'],
      counterMatchups: {
        Ornn: 5.6,
        Sion: 6.0,
        Malphite: 4.2,
        Riven: -4.5,
        Jax: -4.8,
      }
    }
  },
  Jax: {
    TOP: {
      championId: 'Jax',
      role: 'TOP',
      expectedDpm: 610,
      gd15: 190,
      csd15: 5.5,
      winrate: 51.0,
      damageShare: 23.4,
      earlyDominanceScore: 78,
      killPressureLv3: 80,
      killPressureLv6: 88,
      scalingProfile: 'LATE',
      powerSpikes: ['Niv 1 (E stun)', 'Force de la Trinité', 'Niv 11'],
      keyStrengths: ['Esquive totale des autos (E)', 'Splitpush létal', 'Armure/RM instantanée sous R'],
      counterMatchups: {
        Camille: 4.9,
        Irelia: 5.2,
        Gwen: 4.8,
        Malphite: -5.4,
        Poppy: -4.6,
        Gragas: -3.8,
      }
    }
  },

  // === JUNGLE ===
  LeeSin: {
    JUNGLE: {
      championId: 'LeeSin',
      role: 'JUNGLE',
      expectedDpm: 520,
      gd15: 310,
      csd15: 4.5,
      winrate: 49.5,
      damageShare: 19.5,
      earlyDominanceScore: 92,
      killPressureLv3: 95,
      killPressureLv6: 94,
      scalingProfile: 'EARLY',
      powerSpikes: ['Niv 3 (Double buff invade)', 'Niv 6 (InSec kick)', 'Éclipse (1er Item)'],
      keyStrengths: ['Mobilité hors norme', 'Gank précoce dévastateur', 'Contrôle d\'objectifs neutres'],
      counterMatchups: {
        Karthus: 6.4,
        MasterYi: 4.8,
        Amumu: 4.1,
        Poppy: -5.1,
        Viego: 2.2,
      }
    }
  },
  Viego: {
    JUNGLE: {
      championId: 'Viego',
      role: 'JUNGLE',
      expectedDpm: 610,
      gd15: 140,
      csd15: 3.2,
      winrate: 51.0,
      damageShare: 23.8,
      earlyDominanceScore: 74,
      killPressureLv3: 72,
      killPressureLv6: 88,
      scalingProfile: 'LATE',
      powerSpikes: ['Lame du Roi Déchu', '1er Reset en escarmouche', 'Tueur de Krakens'],
      keyStrengths: ['Possession et resets en teamfight', 'Stun furtif (E + Z)', 'Exécution sous R'],
      counterMatchups: {
        JarvanIV: 3.2,
        Kayn: 2.8,
        Rammus: -5.5,
        Sejuani: -3.4,
      }
    }
  },
  JarvanIV: {
    JUNGLE: {
      championId: 'JarvanIV',
      role: 'JUNGLE',
      expectedDpm: 490,
      gd15: 280,
      csd15: 3.0,
      winrate: 51.4,
      damageShare: 17.5,
      earlyDominanceScore: 90,
      killPressureLv3: 92,
      killPressureLv6: 95,
      scalingProfile: 'MID',
      powerSpikes: ['Niv 2 (E + A)', 'Niv 6 (Cataclysme R)', 'Hydre Profane'],
      keyStrengths: ['Engage instantanée', 'Isolement des cibles sans flash', 'Buff d\'Attack Speed allié'],
      counterMatchups: {
        Jhin: 5.8,
        MissFortune: 5.5,
        Ashe: 5.2,
        Poppy: -5.4,
        Viego: -3.2,
      }
    }
  },
  Sejuani: {
    JUNGLE: {
      championId: 'Sejuani',
      role: 'JUNGLE',
      expectedDpm: 430,
      gd15: 90,
      csd15: -1.2,
      winrate: 50.8,
      damageShare: 14.5,
      earlyDominanceScore: 80,
      killPressureLv3: 75,
      killPressureLv6: 94,
      scalingProfile: 'MID',
      powerSpikes: ['Niv 4 (Stun E disponible)', 'Niv 6 (Prison de Glace)', 'Cotte Épineuse'],
      keyStrengths: ['Synergie massive avec alliés mêlée', 'Résistance innée passive', 'Initiation longue portée'],
      counterMatchups: {
        MasterYi: 6.8,
        Viego: 3.4,
        KhaZix: 4.2,
        Trundle: -6.5,
        Sylas: -4.1,
      }
    }
  },

  // === MID ===
  Yasuo: {
    MID: {
      championId: 'Yasuo',
      role: 'MID',
      expectedDpm: 660,
      gd15: 210,
      csd15: 8.4,
      winrate: 50.2,
      damageShare: 25.5,
      earlyDominanceScore: 84,
      killPressureLv3: 82,
      killPressureLv6: 88,
      scalingProfile: 'LATE',
      powerSpikes: ['Niv 2 (A + E dash)', 'Lame du Roi Déchu', '100% Critique (2 items)'],
      keyStrengths: ['Mur de vent annule 100% des projectiles', 'Mobilité illimitée sur vagues', 'Synergie knock-up'],
      counterMatchups: {
        TwistedFate: 6.2,
        Syndra: 4.8,
        Lux: 5.4,
        Renekton: -6.8,
        Pantheon: -6.2,
        Malzahar: -4.5,
      }
    }
  },
  Ahri: {
    MID: {
      championId: 'Ahri',
      role: 'MID',
      expectedDpm: 620,
      gd15: 110,
      csd15: 3.8,
      winrate: 51.6,
      damageShare: 23.5,
      earlyDominanceScore: 78,
      killPressureLv3: 70,
      killPressureLv6: 92,
      scalingProfile: 'MID',
      powerSpikes: ['Niv 6 (Triple Dash R)', 'Compagnon de Luden', 'Sablier de Zhonya'],
      keyStrengths: ['Safe pick absolu', 'Pick-up au Charme (E)', 'Roam et présence d\'objectifs'],
      counterMatchups: {
        Katarina: 4.5,
        LeBlanc: 3.2,
        Orianna: 2.8,
        Yasuo: -3.8,
        Tristana: -4.2,
      }
    }
  },
  Sylas: {
    MID: {
      championId: 'Sylas',
      role: 'MID',
      expectedDpm: 690,
      gd15: 160,
      csd15: -2.5,
      winrate: 51.0,
      damageShare: 27.0,
      earlyDominanceScore: 80,
      killPressureLv3: 88,
      killPressureLv6: 94,
      scalingProfile: 'LATE',
      powerSpikes: ['Niv 3 (E + Z burst/heal)', 'Flamme-Ombre / Fléau de Liche', 'Vol d\'ultime game-breaker'],
      keyStrengths: ['Soin massif sur le Z', 'Burst AP instantané', 'Vol des meilleurs ultimes adverses'],
      counterMatchups: {
        Malphite: 6.8,
        Amumu: 5.9,
        Ashe: 5.1,
        Cassiopeia: -5.4,
        Heimerdinger: -4.8,
      }
    }
  },

  // === BOTTOM (ADC) ===
  Jinx: {
    BOTTOM: {
      championId: 'Jinx',
      role: 'BOTTOM',
      expectedDpm: 760,
      gd15: 40,
      csd15: 2.2,
      winrate: 51.8,
      damageShare: 31.0,
      earlyDominanceScore: 68,
      killPressureLv3: 62,
      killPressureLv6: 82,
      scalingProfile: 'HYPER',
      powerSpikes: ['Lame d\'Infini', 'Canon Fast-Fire / Ouragan', 'Niv 11'],
      keyStrengths: ['Portée immense sous Roquettes Q', 'Passif En Trombe en chaîne', 'DPS de zone massif'],
      counterMatchups: {
        Aphelios: 3.8,
        Varus: 3.2,
        Kaisa: 2.5,
        Samira: -4.2,
        Draven: -5.8,
      }
    }
  },
  Kaisa: {
    BOTTOM: {
      championId: 'Kaisa',
      role: 'BOTTOM',
      expectedDpm: 730,
      gd15: 80,
      csd15: 1.8,
      winrate: 50.9,
      damageShare: 29.5,
      earlyDominanceScore: 72,
      killPressureLv3: 75,
      killPressureLv6: 90,
      scalingProfile: 'LATE',
      powerSpikes: ['Évolution Q (100 AD)', 'Évolution E (Invisibilité)', 'Niv 11'],
      keyStrengths: ['Repositionnement et bouclier sous R', 'Dégâts hybrides inarrêtables', 'Exécution au Plasma'],
      counterMatchups: {
        Zeri: 3.5,
        Ezreal: 3.2,
        Draven: -5.1,
        Caitlyn: -4.5,
      }
    }
  },

  // === SUPPORT ===
  Thresh: {
    SUPPORT: {
      championId: 'Thresh',
      role: 'SUPPORT',
      expectedDpm: 230,
      gd15: 180,
      csd15: 0.5,
      winrate: 50.6,
      damageShare: 9.2,
      earlyDominanceScore: 86,
      killPressureLv3: 88,
      killPressureLv6: 90,
      scalingProfile: 'MID',
      powerSpikes: ['Niv 2 (A + E)', 'Bottes de Lucidité', 'Lanterne de sauvetage W'],
      keyStrengths: ['Polyvalence absolue (Engage & Disengage)', 'Lanterne sauve un allié', 'Contrôles continus'],
      counterMatchups: {
        Nautilus: 2.8,
        Leona: 3.2,
        Yuumi: 5.1,
        Morgana: -5.5,
        Zyra: -4.2,
      }
    }
  },
  Nautilus: {
    SUPPORT: {
      championId: 'Nautilus',
      role: 'SUPPORT',
      expectedDpm: 250,
      gd15: 220,
      csd15: 0.8,
      winrate: 51.1,
      damageShare: 9.8,
      earlyDominanceScore: 90,
      killPressureLv3: 92,
      killPressureLv6: 96,
      scalingProfile: 'EARLY',
      powerSpikes: ['Niv 2 (A + Passif root)', 'Niv 6 (R point-and-click)', 'Bottes de Mobilité'],
      keyStrengths: ['Contrôle ciblé inévitable (R)', 'Hitbox énorme de l\'Ancre', 'Shield massif sous W'],
      counterMatchups: {
        Lux: 6.2,
        Sona: 6.8,
        Janna: 4.1,
        Morgana: -6.8,
        Braum: -4.5,
      }
    }
  }
};

/**
 * Calcule ou extrapole les métriques DPM d'un champion selon son kit et ses stats
 */
export function getChampionDpmMetrics(champion: LoLChampion | null, role: LoLRole): ChampionDpmMetrics {
  if (!champion) {
    return {
      championId: 'Unknown',
      role,
      expectedDpm: 500,
      gd15: 0,
      csd15: 0,
      winrate: 50.0,
      damageShare: 20.0,
      earlyDominanceScore: 50,
      killPressureLv3: 50,
      killPressureLv6: 50,
      scalingProfile: 'BALANCED',
      powerSpikes: ['Niv 3', '1er Objet Majeur', 'Niv 6'],
      keyStrengths: ['Polyvalence générale'],
      counterMatchups: {},
    };
  }

  // Vérifier si présent dans la base étalonnée
  const direct = DPM_DATABASE[champion.id]?.[role] || DPM_DATABASE[champion.id]?.['MID'] || DPM_DATABASE[champion.id]?.['TOP'];
  if (direct) {
    return direct;
  }

  // Algorithme d'inférence statistique selon le profil de base Riot
  const isMarksman = champion.tags.includes('Marksman');
  const isMage = champion.tags.includes('Mage');
  const isAssassin = champion.tags.includes('Assassin');
  const isTank = champion.tags.includes('Tank');
  const isSupport = role === 'SUPPORT';

  let baseDpm = 550;
  let baseGd15 = 50;
  let baseCsd15 = 1.0;
  let dmgShare = 21.0;
  let earlyScore = 70;
  let scaling: ChampionDpmMetrics['scalingProfile'] = 'MID';

  if (isSupport) {
    baseDpm = isMage ? 420 : 220;
    baseGd15 = 120;
    dmgShare = isMage ? 16.0 : 8.5;
    scaling = 'MID';
    earlyScore = isTank ? 85 : 72;
  } else if (isMarksman) {
    baseDpm = 720;
    baseGd15 = 60;
    baseCsd15 = 2.5;
    dmgShare = 29.0;
    scaling = 'HYPER';
    earlyScore = 65;
  } else if (isMage) {
    baseDpm = 640;
    baseGd15 = 120;
    baseCsd15 = 4.0;
    dmgShare = 25.0;
    scaling = 'LATE';
    earlyScore = 74;
  } else if (isAssassin) {
    baseDpm = 610;
    baseGd15 = 280;
    baseCsd15 = 5.0;
    dmgShare = 23.5;
    scaling = 'EARLY';
    earlyScore = 88;
  } else if (isTank) {
    baseDpm = 440;
    baseGd15 = -40;
    baseCsd15 = -1.5;
    dmgShare = 15.0;
    scaling = 'LATE';
    earlyScore = 60;
  }

  return {
    championId: champion.id,
    role,
    expectedDpm: baseDpm,
    gd15: baseGd15,
    csd15: baseCsd15,
    winrate: 50.5,
    damageShare: dmgShare,
    earlyDominanceScore: earlyScore,
    killPressureLv3: isAssassin || isMarksman ? 82 : 68,
    killPressureLv6: 86,
    scalingProfile: scaling,
    powerSpikes: ['Niveau 3', 'Premier Objet Complété', 'Niveau 11'],
    keyStrengths: [
      isMarksman ? 'DPS continu à distance' : isAssassin ? 'Burst instantané' : isTank ? 'Encaissement et contrôles' : 'Pression de zone'
    ],
    counterMatchups: {},
  };
}

/**
 * Compare deux champions en face à face sur la même lane pour générer la fiche DPM Matchup
 */
export function getMatchupDpmComparison(
  playerChamp: LoLChampion | null,
  enemyChamp: LoLChampion | null,
  role: LoLRole
): MatchupDpmComparison | null {
  if (!playerChamp || !enemyChamp) return null;

  const playerMetrics = getChampionDpmMetrics(playerChamp, role);
  const enemyMetrics = getChampionDpmMetrics(enemyChamp, role);

  const deltaDpm = playerMetrics.expectedDpm - enemyMetrics.expectedDpm;
  const deltaGd15 = playerMetrics.gd15 - enemyMetrics.gd15;
  const deltaCsd15 = Number((playerMetrics.csd15 - enemyMetrics.csd15).toFixed(1));

  // Vérifier contre direct connu
  const knownCounterBonus = playerMetrics.counterMatchups[enemyChamp.id] || 0;
  const knownCounterMalus = enemyMetrics.counterMatchups[playerChamp.id] || 0;
  const netMatchupDelta = knownCounterBonus - knownCounterMalus;

  // Calcul du score d'avantage de lane (-50 à +50%)
  const rawAdvantage = Math.round(
    ((deltaGd15 / 50) + (deltaCsd15 * 1.5) + (netMatchupDelta * 5) + ((playerMetrics.earlyDominanceScore - enemyMetrics.earlyDominanceScore) * 0.3))
  );
  const laneAdvantagePercent = Math.max(-45, Math.min(45, rawAdvantage));

  let laneFavorite: 'PLAYER' | 'ENEMY' | 'EVEN' = 'EVEN';
  if (laneAdvantagePercent >= 6) laneFavorite = 'PLAYER';
  else if (laneAdvantagePercent <= -6) laneFavorite = 'ENEMY';

  let tacticalKey = '';
  if (playerMetrics.earlyDominanceScore > enemyMetrics.earlyDominanceScore) {
    tacticalKey = `Prenez l'ascendant dès les niveaux 1 à 3 en contrôlant la vague. Votre champion a un GD@15 supérieur (${deltaGd15 >= 0 ? `+${deltaGd15}g` : `${deltaGd15}g`}).`;
  } else {
    tacticalKey = `Jouez patiemment sous votre tour en attendant vos premiers objets. L'adversaire a un pic précoce plus brutal.`;
  }

  const dangerWindow = enemyMetrics.killPressureLv6 >= 90
    ? `Danger extrême au niveau 6 : l'ultime de ${enemyChamp.name} peut vous burst d'un coup.`
    : `Attention aux escarmouches avec le jungler ennemi vers 3:30.`;

  const winCondition = playerMetrics.scalingProfile === 'HYPER' || playerMetrics.scalingProfile === 'LATE'
    ? `Garantir un farm stable à 8+ CS/min et jouer les combats groupés autour du 3ème dragon.`
    : `Exploiter votre avantage d'or avant 20:00 et convertir vos éliminations en tours et héraut.`;

  return {
    playerChamp,
    enemyChamp,
    role,
    playerMetrics,
    enemyMetrics,
    deltaDpm,
    deltaGd15,
    deltaCsd15,
    laneAdvantagePercent,
    laneFavorite,
    tacticalKey,
    dangerWindow,
    winCondition,
  };
}
