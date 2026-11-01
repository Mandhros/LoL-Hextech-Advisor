/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLChampion, LoLBuild, DraftState, CompAnalysis, DraftSuggestion, RuneTreeKey, CoachDraftDiagnosis, LoLRole } from '../types/lol';
import { riotDataService } from './riotDataService';
import { RUNE_TREES_META, DEFAULT_SHARDS } from '../data/starterRunes';
import { buildEngine } from './buildEngine';
import { coachEngine } from './coachEngine';
import { CHAMPION_THEORIES, generateDynamicExoticTheory } from '../data/championTheories';

const LOCAL_STORAGE_KEY_API_KEY = 'lol_advisor_custom_gemini_key';

// Cache en mémoire pour éviter tout appel répété ou boucle infinie
const EXOTIC_BUILDS_CACHE: Record<string, LoLBuild[]> = {};
const IN_FLIGHT_REQUESTS: Record<string, Promise<LoLBuild[]>> = {};

function getBuildsCacheKey(championId: string, role: string, enemies: DraftState['enemies']): string {
  const enemyList = Object.values(enemies || {}).filter(Boolean).map(c => c?.id).sort().join('_');
  return `builds_${championId}_${role}_${enemyList}`;
}

export class GeminiService {
  getUserCustomApiKey(): string {
    return localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY) || '';
  }

  setUserCustomApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, key.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_API_KEY);
    }
  }

  /**
   * Génération des 2 Builds Exotiques (Builds 4 & 5) STRICTEMENT pour le champion sélectionné
   * avec cache mémoire et déduplication pour protéger le quota API de l'utilisateur
   */
  async generateExoticBuilds(
    champion: LoLChampion,
    role: string,
    draft: DraftState,
    compAnalysis: CompAnalysis
  ): Promise<LoLBuild[]> {
    const cacheKey = getBuildsCacheKey(champion.id, role, draft.enemies);

    // 1. Retourner immédiatement depuis le cache si déjà calculé
    const cachedBuilds = EXOTIC_BUILDS_CACHE[cacheKey];
    if (cachedBuilds) {
      return cachedBuilds;
    }

    // 2. Si une requête est déjà en cours pour ce même build, mutualiser la promesse
    const existingRequest = IN_FLIGHT_REQUESTS[cacheKey];
    if (existingRequest) {
      return existingRequest;
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch('/api/gemini/exotic-builds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            champion,
            role,
            allies: draft.allies,
            enemies: draft.enemies,
            compAnalysis,
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.builds && Array.isArray(data.builds) && data.builds.length >= 2) {
            const mapped = this.mapRawAiBuildsToLoLBuilds(champion, data.builds);
            EXOTIC_BUILDS_CACHE[cacheKey] = mapped;
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Serveur proxy Gemini injoignable, tentative en mode client/fallback:', err);
      }

      // Si on est sur GitHub Pages statique et que l'utilisateur a renseigné sa clé locale
      const customKey = this.getUserCustomApiKey();
      if (customKey) {
        try {
          const builds = await this.callGeminiDirectClient(champion, role, draft, compAnalysis, customKey);
          if (builds && builds.length >= 2) {
            EXOTIC_BUILDS_CACHE[cacheKey] = builds;
            return builds;
          }
        } catch (clientErr) {
          console.warn('Appel client direct Gemini a échoué:', clientErr);
        }
      }

      // Fallback gracieux et instantané avec les builds exotiques viables intégrés adaptés au rôle
      const fallbackBuilds = buildEngine.getFallbackExoticBuilds(champion, role as any);
      EXOTIC_BUILDS_CACHE[cacheKey] = fallbackBuilds;
      return fallbackBuilds;
    })();

    IN_FLIGHT_REQUESTS[cacheKey] = requestPromise;

    try {
      const result = await requestPromise;
      return result;
    } finally {
      delete IN_FLIGHT_REQUESTS[cacheKey];
    }
  }

  /**
   * Recommandations de Draft 5v5 (Contre-picks, Synergies, Cheese surprise)
   * avec EXCLUSION STRICTE des champions déjà sélectionnés ou bannis
  /**
   * Recommandations de draft complètes avec diagnostic de niveau Coach des Worlds
   */
  async getDraftSuggestionsWithDiagnosis(
    playerRole: LoLRole,
    allies: DraftState['allies'],
    enemies: DraftState['enemies'],
    bans: DraftState['bans']
  ): Promise<{ suggestions: DraftSuggestion[]; diagnosis: CoachDraftDiagnosis }> {
    // Calcul de l'ensemble des IDs déjà pris ou bannis
    const unavailableIds = new Set<string>();
    Object.values(allies).forEach(c => { if (c) unavailableIds.add(c.id); });
    Object.values(enemies).forEach(c => { if (c) unavailableIds.add(c.id); });
    (bans.blue || []).forEach(c => { if (c) unavailableIds.add(c.id); });
    (bans.red || []).forEach(c => { if (c) unavailableIds.add(c.id); });

    try {
      const response = await fetch('/api/gemini/draft-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerRole, allies, enemies, bans })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          const mapped = this.mapRawSuggestions(data.suggestions, unavailableIds, playerRole, enemies, allies);
          if (mapped.length >= 3) {
            const diagnosis: CoachDraftDiagnosis = data.diagnosis || coachEngine.generateWorldsDraftAnalysis(playerRole, allies, enemies, bans).diagnosis;
            return { suggestions: mapped, diagnosis };
          }
        }
      }
    } catch (err) {
      console.warn('Draft suggestions proxy indisponible, exécution du Coach Worlds hors-ligne infaillible:', err);
    }

    // Moteur déterministe Coach des Worlds hors-ligne d'une précision infaillible
    return coachEngine.generateWorldsDraftAnalysis(playerRole, allies, enemies, bans);
  }

  async getDraftSuggestions(
    playerRole: string,
    allies: DraftState['allies'],
    enemies: DraftState['enemies'],
    bans: DraftState['bans']
  ): Promise<DraftSuggestion[]> {
    const result = await this.getDraftSuggestionsWithDiagnosis(playerRole as LoLRole, allies, enemies, bans);
    return result.suggestions;
  }

  private mapRawAiBuildsToLoLBuilds(champion: LoLChampion, rawBuilds: any[]): LoLBuild[] {
    return rawBuilds.slice(0, 2).map((raw, idx) => {
      const isExotic1 = idx === 0;
      
      const starter = riotDataService.getItemById(raw.starterItemName) || riotDataService.getItemById('1055')!;
      const boots = riotDataService.getItemById(raw.bootsName) || riotDataService.getItemById('3047')!;
      
      const coreItems = (raw.coreItemNames || []).map((name: string) => 
        riotDataService.getItemById(name) || riotDataService.getAllItems()[Math.floor(Math.random() * 10)]
      ).filter(Boolean);

      const lateItems = (raw.lateItemNames || []).map((name: string) => 
        riotDataService.getItemById(name) || riotDataService.getAllItems()[Math.floor(Math.random() * 10)]
      ).filter(Boolean);

      const situationalItems = (raw.situationalItemNames || []).map((name: string) => 
        riotDataService.getItemById(name) || riotDataService.getAllItems()[Math.floor(Math.random() * 10)]
      ).filter(Boolean);

      const primaryTreeKey: RuneTreeKey = (['Precision', 'Domination', 'Sorcery', 'Resolve', 'Inspiration'].includes(raw.primaryTree)
        ? raw.primaryTree
        : isExotic1 ? 'Domination' : 'Inspiration') as RuneTreeKey;
      
      const tree = RUNE_TREES_META[primaryTreeKey] || RUNE_TREES_META.Precision;
      const keystone = tree.keystones.find(k => k.name.toLowerCase().includes((raw.primaryKeystoneName || '').toLowerCase())) || tree.keystones[0];

      const secTreeKey: RuneTreeKey = (['Precision', 'Domination', 'Sorcery', 'Resolve', 'Inspiration'].includes(raw.secondaryTree) && raw.secondaryTree !== primaryTreeKey
        ? raw.secondaryTree
        : primaryTreeKey === 'Precision' ? 'Resolve' : 'Precision') as RuneTreeKey;
      const secTree = RUNE_TREES_META[secTreeKey] || RUNE_TREES_META.Resolve;

      let skillOrder: ('Q' | 'W' | 'E' | 'R')[] = ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W', 'R', 'W', 'W'];
      if (Array.isArray(raw.skillOrder) && raw.skillOrder.length >= 18) {
        skillOrder = raw.skillOrder.slice(0, 18).map((k: string) => (['Q', 'W', 'E', 'R'].includes(k) ? k : 'Q') as any);
      }

      const title = raw.title && raw.title.includes(champion.name) 
        ? raw.title 
        : `${raw.title || 'Build Exotique'} (${champion.name})`;

      return {
        id: `${champion.id}-ai-exotic-${idx + 1}`,
        type: isExotic1 ? 'EXOTIC_1' : 'EXOTIC_2',
        badgeLabel: isExotic1 ? 'BUILD 4 : EXOTIQUE VIABLE' : 'BUILD 5 : SIGNATURE CHEESE',
        title: title,
        tagline: raw.tagline || (isExotic1 ? 'Synergie secrète et optimisation mathématique.' : 'Pick cheese signature imprévisible.'),
        description: raw.description || `Build exotique conçu spécifiquement pour exploiter les mécaniques de ${champion.name}.`,
        winCondition: raw.winCondition || 'Prendre l\'ascendant lors des premiers escarmouches d\'objectifs.',
        powerSpikes: raw.powerSpikes && raw.powerSpikes.length > 0 ? raw.powerSpikes : ['1er Objet', 'Niveau 6', 'Full Build 6 Objets'],
        starterItems: [starter],
        boots: boots,
        coreItems: coreItems.length >= 2 ? coreItems : [riotDataService.getItemById('3078')!, riotDataService.getItemById('3153')!],
        lateItems: lateItems.length >= 2 ? lateItems : [riotDataService.getItemById('6665')!, riotDataService.getItemById('3026')!],
        situationalItems: situationalItems.length >= 1 ? situationalItems : [riotDataService.getItemById('3157')!],
        runes: {
          primaryTree: primaryTreeKey,
          primaryKeystone: keystone,
          primarySlots: tree.slots.slice(0, 3),
          secondaryTree: secTreeKey,
          secondarySlots: secTree.slots.slice(0, 2),
          shards: DEFAULT_SHARDS,
        },
        skillOrder: skillOrder,
        geminiTips: {
          combo: raw.comboTip || `Utilisez vos délais de récupération de façon cadencée sur ${champion.name}.`,
          synergyHook: raw.synergyHook || 'Idéal pour déstabiliser les calculs défensifs adverses.',
          warningTrap: raw.warningTrap || 'Ne négligez pas la vision autour des objectifs majeurs.'
        },
        isAiGenerated: true,
      };
    });
  }

  private mapRawSuggestions(
    rawList: any[],
    unavailableIds: Set<string>,
    playerRole: string,
    enemies?: DraftState['enemies'],
    allies?: DraftState['allies']
  ): DraftSuggestion[] {
    const suggestions: DraftSuggestion[] = [];
    for (const item of rawList) {
      const champ = riotDataService.getChampionById(item.championName);
      // FILTRAGE STRICT : NE PAS INCLURE SI DÉJÀ SÉLECTIONNÉ OU BANNI
      if (champ && !unavailableIds.has(champ.id)) {
        let hook = item.exoticBuildHook;
        if (!hook || hook.toLowerCase() === 'none' || hook.length < 5) {
          const theory = CHAMPION_THEORIES[champ.name] || CHAMPION_THEORIES[champ.id] || generateDynamicExoticTheory(champ.name, playerRole as any, champ.tags, champ.stats);
          hook = item.synergyType === 'EXOTIC_CHEESE' ? theory.signatureCheese.title : theory.exoticViable.title;
        }

        suggestions.push({
          champion: champ,
          score: item.score || 95,
          tier: item.tier || (item.score >= 96 ? 'S+' : 'S'),
          reason: item.reason || 'Pick d\'élite recommandé par le Head Coach.',
          synergyType: item.synergyType || 'COUNTER',
          winCondition: item.winCondition,
          lanePhasePlan: item.lanePhasePlan,
          teamfightRole: item.teamfightRole,
          coachWarning: item.coachWarning,
          exoticBuildHook: hook,
          keyMatchupAdvantage: item.keyMatchupAdvantage
        });
      }
    }
    return suggestions.length >= 3
      ? suggestions
      : coachEngine.generateWorldsDraftAnalysis(
          playerRole as LoLRole,
          allies || { TOP: null, JUNGLE: null, MID: null, BOTTOM: null, SUPPORT: null },
          enemies || { TOP: null, JUNGLE: null, MID: null, BOTTOM: null, SUPPORT: null },
          { blue: [], red: [] }
        ).suggestions;
  }

  /**
   * Moteur de recommandation de draft dynamique et contextuel
   * Analyse l'adversaire direct sur la lane, le profil de l'équipe ennemie et les synergies alliées
   */
  private getFallbackDraftSuggestions(
    role: string,
    unavailableIds: Set<string>,
    enemies?: DraftState['enemies'],
    allies?: DraftState['allies']
  ): DraftSuggestion[] {
    const allChamps = riotDataService.getAllChampions();
    const available = allChamps.filter(c => !unavailableIds.has(c.id));
    const roleChamps = available.filter(c => c.roles.includes(role as any));
    const pool = roleChamps.length >= 3 ? roleChamps : available;

    if (pool.length === 0) return [];

    // Adversaire direct sur la lane ciblée
    const enemyOpponent = enemies ? (enemies as Record<string, LoLChampion | null>)[role] : null;
    const enemyList = enemies ? Object.values(enemies).filter((c): c is LoLChampion => Boolean(c)) : [];
    const allyList = allies ? Object.values(allies).filter((c): c is LoLChampion => Boolean(c)) : [];

    // Table de match-up et de contres reconnus sur la scène compétitive
    const matchupDatabase: Record<string, {
      preferredPicks: string[];
      counterAgainst: string[];
      counterText: (enemy: string) => string;
      synergyWith: string[];
      synergyText: (ally: string) => string;
      cheeseHook: string;
      cheeseText: string;
    }[]> = {
      TOP: [
        {
          preferredPicks: ['Malphite', 'Poppy', 'Shen'],
          counterAgainst: ['Tryndamere', 'Jax', 'Irelia', 'Fiora', 'Yasuo', 'Yone', 'Quinn', 'Teemo', 'Aatrox', 'Riven', 'Camille'],
          counterText: (e) => `Broie l'armure et détruit la vitesse d'attaque de ${e} avec Choc au sol (-50% AS) et Bouclier de granit, rendant tout trade intenable pour l'adversaire.`,
          synergyWith: ['Yasuo', 'Diana', 'Samira', 'Orianna', 'MissFortune'],
          synergyText: (a) => `Synergie dévastatrice avec ${a} : projection aérienne de zone (R) garantissant un enchaînement létal immédiat.`,
          cheeseHook: "Malphite 100% AP Météore & Moisson Noire",
          cheeseText: "Burst magique instantané qui supprime l'adversaire dès le niveau 6 sans riposte possible."
        },
        {
          preferredPicks: ['Fiora', 'Gwen', 'Camille', 'Darius'],
          counterAgainst: ['Sion', 'ChoGath', 'Malphite', 'Ornn', 'TahmKench', 'KSante', 'Mordekaiser', 'Garen', 'Sett'],
          counterText: (e) => `Déchiquette les points de vie de ${e} grâce à des dégâts bruts en % de PV max et ignore son armure en duel.`,
          synergyWith: ['Sejuani', 'Amumu', 'Galio', 'TwistedFate'],
          synergyText: (a) => `Pression de split-push maximale pendant que ${a} verrouille les objectifs neutres avec l'équipe.`,
          cheeseHook: "Darius Vitesse Éclair Phase Rush & Trinité",
          cheeseText: "Vitesse de déplacement surhumaine empêchant l'adversaire de fuir les 5 charges de saignement."
        },
        {
          preferredPicks: ['Aatrox', 'Renekton', 'Gnar', 'Jax'],
          counterAgainst: ['Gangplank', 'Kayle', 'Vladimir', 'Jayce', 'Nasus', 'Kennen'],
          counterText: (e) => `Prend la priorité de lane dès les premiers niveaux face à ${e} avec un zoning agressif et un sustain continu.`,
          synergyWith: ['Sejuani', 'Nautilus', 'Ahri', 'Vi'],
          synergyText: (a) => `Enchaîne les contrôles lourds avec ${a} pour remporter tous les 2v2 en rivière et héraut.`,
          cheeseHook: "Aatrox Létalité & Hydre Profane",
          cheeseText: "Une seule frappe du 3ème A Darkin inflige plus de 1400 dégâts instantanés."
        }
      ],
      JUNGLE: [
        {
          preferredPicks: ['Rammus', 'Sejuani', 'Amumu'],
          counterAgainst: ['MasterYi', 'BelVeth', 'Yasuo', 'Jinx', 'Tryndamere', 'Briar', 'Kindred', 'Viego'],
          counterText: (e) => `Neutralise complètement ${e} : renvoie ses attaques de base et le force à attaquer une muraille d'épines.`,
          synergyWith: ['Yasuo', 'Orianna', 'Kassadin', 'MissFortune'],
          synergyText: (a) => `Fournit une frontline ultra-solide et regroupe les ennemis sous les compétences de ${a}.`,
          cheeseHook: "Amumu AP One-Shot Onde Tempétueuse",
          cheeseText: "Désintègre 3 cibles d'un seul ultime grâce à la Malédiction magique amplifiée."
        },
        {
          preferredPicks: ['Lillia', 'Viego', 'Kindred'],
          counterAgainst: ['Sion', 'ChoGath', 'Sejuani', 'Zac', 'Darius', 'Udyr', 'Rammus'],
          counterText: (e) => `Vitesse de course surhumaine pour kiter ${e} et brûlure en % de PV max rendant le tanking inutile.`,
          synergyWith: ['MissFortune', 'Rumble', 'Hwei', 'Ahri'],
          synergyText: (a) => `Endort l'équipe adverse avec Douce berceuse pour garantir l'impact maximal de l'ultime de ${a}.`,
          cheeseHook: "Lillia Vitesse Cosmique & Créateur de failles",
          cheeseText: "Intouchable et intuable en escarmouche prolongée grâce aux 650+ de vitesse constante."
        },
        {
          preferredPicks: ['Vi', 'JarvanIV', 'Nocturne'],
          counterAgainst: ['Zeri', 'Lucian', 'Ahri', 'LeBlanc', 'Ezreal', 'Katarina', 'Jinx'],
          counterText: (e) => `Verrouillage ciblé inévitable avec Marteau-pilon (R) : supprime toute mobilité et échappatoire à ${e}.`,
          synergyWith: ['Yasuo', 'Syndra', 'Orianna'],
          synergyText: (a) => `Projette la cible prioritaire dans les airs pour permettre à ${a} de déclencher son plein combo.`,
          cheeseHook: "Vi Full Létalité & Électrocution",
          cheeseText: "Élimination chirurgicale du carry adverse en moins de 0.3s dès la sortie de l'ombre."
        }
      ],
      MID: [
        {
          preferredPicks: ['Malzahar', 'Galio', 'Vex'],
          counterAgainst: ['Yasuo', 'Yone', 'Zed', 'Katarina', 'Akali', 'LeBlanc', 'Fizz', 'Irelia'],
          counterText: (e) => `Cloue ${e} sur place avec une suppression ou un anti-dash inarrêtable qui punit chaque agression ennemie.`,
          synergyWith: ['JarvanIV', 'Camille', 'Nocturne', 'Amumu'],
          synergyText: (a) => `Garantit un verrouillage de 2.5 secondes permettant à ${a} de déverser ses dégâts sans rater.`,
          cheeseHook: "Galio AP Météore & Moisson Noire",
          cheeseText: "S'abat sur le combat comme un météore et supprime les squishies d'un seul impact."
        },
        {
          preferredPicks: ['Ahri', 'Yasuo', 'Syndra'],
          counterAgainst: ['TwistedFate', 'Lux', 'Xerath', 'VelKoz', 'Veigar', 'Zoe', 'Hwei'],
          counterText: (e) => `Surclasse ${e} en esquivant ses skillshots et intercepte ses projectiles clés avec une mobilité supérieure.`,
          synergyWith: ['Malphite', 'Diana', 'Zac', 'Nautilus', 'Vi'],
          synergyText: (a) => `Capitalise immédiatement sur chaque projection aérienne initiée par ${a}.`,
          cheeseHook: "Yasuo AP Dégâts Magiques & E-Max",
          cheeseText: "100% de dégâts magiques inattendus qui rendent caduque l'armure de l'adversaire."
        },
        {
          preferredPicks: ['Zed', 'Akali', 'Sylas'],
          counterAgainst: ['Veigar', 'AurelionSol', 'Brand', 'Anivia', 'Kassadin'],
          counterText: (e) => `Passe sous tour avec Marque de la mort pour exécuter ${e} avant son premier pic de puissance.`,
          synergyWith: ['JarvanIV', 'Sejuani', 'Thresh'],
          synergyText: (a) => `Exploite la diversion créée par ${a} pour fondre sur les lignes arrières vulnérables.`,
          cheeseHook: "Zed Hydre Profane & Couperet Noir",
          cheeseText: "Waveclear instantané et régénération en duel le rendant intuable en side-lane."
        }
      ],
      BOT: [
        {
          preferredPicks: ['Vayne', 'KaiSa', 'Varus'],
          counterAgainst: ['Malphite', 'Sion', 'ChoGath', 'TahmKench', 'Ornn', 'KSante', 'DrMundo', 'Rammus'],
          counterText: (e) => `Dégâts bruts et hybrides en % de PV max pulvérisant les défenses de ${e} sans aucune résistance possible.`,
          synergyWith: ['Lulu', 'Milio', 'Nautilus', 'Thresh', 'Leona'],
          synergyText: (a) => `Chaque contrôle de ${a} offre l'opportunité d'empiler le passif et de sécuriser un kill facile.`,
          cheeseHook: "Kai'Sa Full AP Sniper W-Poke",
          cheeseText: "Deux tirs de Rayon du vide à 3000 unités éliminent un carry sans jamais s'exposer."
        },
        {
          preferredPicks: ['Samira', 'Xayah', 'Ezreal'],
          counterAgainst: ['Ezreal', 'MissFortune', 'Jhin', 'Ashe', 'Caitlyn', 'Tristana'],
          counterText: (e) => `Détruit les projectiles et tirs critiques de ${e} avec Tourbillon de lames ou esquive avec un ultime protecteur.`,
          synergyWith: ['Nautilus', 'Rell', 'Leona', 'Alistar', 'Rakan'],
          synergyText: (a) => `Prolonge les bumps de ${a} pour atteindre le rang S et déclencher l'ultime infernal.`,
          cheeseHook: "Samira Conquérant & Danse de la mort",
          cheeseText: "Capacité de drain-tank monstrueuse qui permet de foncer dans les 5 ennemis en survivant."
        },
        {
          preferredPicks: ['Jinx', 'Caitlyn', 'Ashe'],
          counterAgainst: ['Aphelios', 'Vayne', 'KaiSa', 'Samira', 'Twitch'],
          counterText: (e) => `Surpasse la portée de ${e} avec 725+ d'allonge pour l'asphyxier sous sa tourelle dès le début du match.`,
          synergyWith: ['Thresh', 'Lulu', 'Milio', 'Blitzcrank'],
          synergyText: (a) => `Place les pièges et pyromâcheurs sur les cibles immobilisées par ${a} pour une neutralisation totale.`,
          cheeseHook: "Jinx Létalité & Faucheur d'Essence",
          cheeseText: "Snipes planétaires à très longue portée qui exécutent les ennemis à distance."
        }
      ],
      SUPPORT: [
        {
          preferredPicks: ['Thresh', 'Janna', 'Poppy'],
          counterAgainst: ['Leona', 'Zac', 'Tristana', 'Diana', 'JarvanIV', 'Rengar', 'Alistar'],
          counterText: (e) => `Interrompt net les sauts et engages de ${e} en plein vol et extrait ses alliés avec la Lanterne.`,
          synergyWith: ['Jinx', 'Draven', 'Samira', 'Yasuo', 'Lucian'],
          synergyText: (a) => `Offre un placement idéal à ${a} et verrouille la cible pour faciliter son DPS continu.`,
          cheeseHook: "Thresh One-Punch Crit Létalité",
          cheeseText: "Une attaque de base chargée du passif E inflige 1200+ dégâts critiques instantanés."
        },
        {
          preferredPicks: ['Nautilus', 'Leona', 'Blitzcrank'],
          counterAgainst: ['Zeri', 'Lucian', 'Ahri', 'Katarina', 'Ezreal', 'Sona', 'Yuumi', 'Soraka'],
          counterText: (e) => `Verrouille ${e} avec 3 contrôles d'affilée sans lui laisser la moindre seconde pour utiliser ses sorts d'échappée.`,
          synergyWith: ['KaiSa', 'Samira', 'MissFortune', 'Jinx'],
          synergyText: (a) => `Applique les contrôles lourds déclenchant les compétences ultimes et passifs explosifs de ${a}.`,
          cheeseHook: "Nautilus AP Mid/Supp Météore",
          cheeseText: "One-shot de zone sur les escarmouches dès la première rotation d'objets."
        },
        {
          preferredPicks: ['Lulu', 'Milio', 'Braum'],
          counterAgainst: ['Zed', 'KhaZix', 'MasterYi', 'Talon', 'Yasuo', 'Ornn', 'MissFortune'],
          counterText: (e) => `Neutralise ${e} : Métamorphose le transforme en créature inoffensive au moment exact de son plongeon.`,
          synergyWith: ['Jinx', 'KogMaw', 'Vayne', 'Twitch', 'Zeri'],
          synergyText: (a) => `Démultiplie la vitesse d'attaque et la survie de ${a} pour en faire un carry intuable.`,
          cheeseHook: "Lulu Machine-Gun Vitesse d'Attaque On-hit",
          cheeseText: "Mitrailleuse surprenante avec Pix et la Dent de Nashor en soutien d'escarmouche."
        }
      ]
    };

    const roleGuides = matchupDatabase[role] || matchupDatabase['TOP'];
    const chosenIds = new Set<string>();
    const suggestions: DraftSuggestion[] = [];

    // 1. Choix du CONTRE-PICK (Score 95 - 98)
    let counterChamp: LoLChampion | null = null;
    let counterReason = "Contre directement le plan de jeu adverse grâce à son kit supérieur et ses contrôles ciblés.";

    // Rechercher un contre spécifique à l'adversaire de lane
    if (enemyOpponent) {
      for (const guide of roleGuides) {
        if (guide.counterAgainst.some(name => name.toLowerCase() === enemyOpponent.id.toLowerCase() || name.toLowerCase() === enemyOpponent.name.toLowerCase())) {
          for (const pickId of guide.preferredPicks) {
            const found = pool.find(c => c.id.toLowerCase() === pickId.toLowerCase() && !chosenIds.has(c.id));
            if (found) {
              counterChamp = found;
              counterReason = guide.counterText(enemyOpponent.name);
              break;
            }
          }
        }
        if (counterChamp) break;
      }
    }

    // Si pas de contre direct spécifique trouvé, chercher selon l'équipe ennemie ou le meilleur champion disponible
    if (!counterChamp) {
      for (const guide of roleGuides) {
        for (const pickId of guide.preferredPicks) {
          const found = pool.find(c => c.id.toLowerCase() === pickId.toLowerCase() && !chosenIds.has(c.id));
          if (found) {
            counterChamp = found;
            const enemyMention = enemyOpponent ? enemyOpponent.name : (enemyList[0] ? enemyList[0].name : "la composition adverse");
            counterReason = guide.counterText(enemyMention);
            break;
          }
        }
        if (counterChamp) break;
      }
    }

    if (!counterChamp && pool.length > 0) {
      counterChamp = pool[0];
      counterReason = enemyOpponent 
        ? `Prend l'avantage face à ${enemyOpponent.name} grâce à sa portée, ses contrôles et son impact en combat.`
        : "Choix de draft extrêmement solide et prioritaire pour sécuriser les objectifs d'équipe.";
    }

    if (counterChamp) {
      chosenIds.add(counterChamp.id);
      const champTheory = (buildEngine as any).getTheoryForChampion?.(counterChamp.id) || generateDynamicExoticTheory(counterChamp.name, role as any, counterChamp.tags, counterChamp.stats);
      suggestions.push({
        champion: counterChamp,
        score: Math.floor(Math.random() * 3) + 96, // 96 - 98
        reason: counterReason,
        synergyType: 'COUNTER',
        exoticBuildHook: champTheory.exoticViable?.title || `${counterChamp.name} Duelliste Hybride & Spikes Létaux`,
      });
    }

    // 2. Choix de la SYNERGIE D'ÉQUIPE (Score 91 - 94)
    let synergyChamp: LoLChampion | null = null;
    let synergyReason = "S'imbrique parfaitement avec vos carrys pour maximiser les contrôles et les dégâts de zone.";

    if (allyList.length > 0) {
      for (const ally of allyList) {
        for (const guide of roleGuides) {
          if (guide.synergyWith.some(name => name.toLowerCase() === ally.id.toLowerCase() || name.toLowerCase() === ally.name.toLowerCase())) {
            for (const pickId of guide.preferredPicks) {
              const found = pool.find(c => c.id.toLowerCase() === pickId.toLowerCase() && !chosenIds.has(c.id));
              if (found) {
                synergyChamp = found;
                synergyReason = guide.synergyText(ally.name);
                break;
              }
            }
          }
          if (synergyChamp) break;
        }
        if (synergyChamp) break;
      }
    }

    if (!synergyChamp) {
      for (const c of pool) {
        if (!chosenIds.has(c.id)) {
          synergyChamp = c;
          const allyMention = allyList[0] ? allyList[0].name : "vos carrys";
          synergyReason = `Excellente coordination tactique avec ${allyMention} pour verrouiller les teamfights et sécuriser les dragons.`;
          break;
        }
      }
    }

    if (synergyChamp) {
      chosenIds.add(synergyChamp.id);
      const champTheory = (buildEngine as any).getTheoryForChampion?.(synergyChamp.id) || generateDynamicExoticTheory(synergyChamp.name, role as any, synergyChamp.tags, synergyChamp.stats);
      suggestions.push({
        champion: synergyChamp,
        score: Math.floor(Math.random() * 3) + 91, // 91 - 93
        reason: synergyReason,
        synergyType: 'SYNERGY',
        exoticBuildHook: champTheory.exoticViable?.title || `${synergyChamp.name} Enchaînement & Synergie d'Équipe`,
      });
    }

    // 3. Choix du PICK SURPRISE / CHEESE EXOTIQUE (Score 87 - 90)
    let cheeseChamp: LoLChampion | null = null;
    let cheeseReason = "Pick signature inattendu pour déstabiliser les choix d'équipements adverses.";
    let cheeseHook = "Build Exotique & Premier Coup (First Strike)";

    // Chercher dans le guide un cheese réputé
    for (const guide of roleGuides) {
      for (const pickId of guide.preferredPicks) {
        const found = pool.find(c => c.id.toLowerCase() === pickId.toLowerCase() && !chosenIds.has(c.id));
        if (found) {
          cheeseChamp = found;
          cheeseReason = guide.cheeseText;
          cheeseHook = guide.cheeseHook;
          break;
        }
      }
      if (cheeseChamp) break;
    }

    if (!cheeseChamp) {
      for (const c of pool) {
        if (!chosenIds.has(c.id)) {
          cheeseChamp = c;
          const dynamicTheory = generateDynamicExoticTheory(c.name, role as any, c.tags, c.stats);
          cheeseHook = dynamicTheory.signatureCheese.title;
          cheeseReason = dynamicTheory.signatureCheese.description.slice(0, 140) + '...';
          break;
        }
      }
    }

    if (cheeseChamp) {
      chosenIds.add(cheeseChamp.id);
      suggestions.push({
        champion: cheeseChamp,
        score: Math.floor(Math.random() * 3) + 87, // 87 - 89
        reason: cheeseReason,
        synergyType: 'EXOTIC_CHEESE',
        exoticBuildHook: cheeseHook,
      });
    }

    return suggestions;
  }

  private async callGeminiDirectClient(
    champion: LoLChampion,
    role: string,
    draft: DraftState,
    compAnalysis: CompAnalysis,
    apiKey: string
  ): Promise<LoLBuild[]> {
    const prompt = `Tu es un expert LoL. Génère 2 builds pour ${champion.name} au rôle ${role} en JSON strict:
[
  {
    "title": "Build 4: Exotique Viable (${champion.name})",
    "badgeLabel": "BUILD 4 : EXOTIQUE VIABLE",
    "tagline": "Synergie innovante",
    "description": "Explication",
    "winCondition": "Win condition",
    "powerSpikes": ["Niveau 6", "Item 1", "Full Build"],
    "starterItemName": "${role === 'SUPPORT' ? 'Atlas des mondes' : role === 'JUNGLE' ? 'Bébé saute-nuages' : 'Lame de Doran'}",
    "bootsName": "Sandales de Mercure",
    "coreItemNames": ["Force de la trinité", "Lame du roi déchu", "Couperet noir"],
    "lateItemNames": ["Danse de la mort", "Ange gardien"],
    "situationalItemNames": ["Gage de Sterak"],
    "primaryTree": "Precision",
    "primaryKeystoneName": "Conquérant",
    "primarySlotNames": ["Triomphe", "Alacrité", "Baroud d'honneur"],
    "secondaryTree": "Resolve",
    "secondarySlotNames": ["Second souffle", "Surcroissance"],
    "comboTip": "Astuce",
    "synergyHook": "Synergie",
    "warningTrap": "Attention"
  },
  {
    "title": "Build 5: Signature Cheese (${champion.name})",
    "badgeLabel": "BUILD 5 : SIGNATURE CHEESE",
    "tagline": "Cheese surprise",
    "description": "Explication cheese",
    "winCondition": "Surprendre",
    "powerSpikes": ["Niveau 3", "Item 1", "Full Build"],
    "starterItemName": "${role === 'SUPPORT' ? 'Atlas des mondes' : role === 'JUNGLE' ? 'Bébé écraseur' : 'Bouclier de Doran'}",
    "bootsName": "Bottes de célérité",
    "coreItemNames": ["Cœuracier", "Cape solaire", "Créateur de failles"],
    "lateItemNames": ["Jak'Sho", "Cotte épineuse"],
    "situationalItemNames": ["Armure de Warmog"],
    "primaryTree": "Inspiration",
    "primaryKeystoneName": "Premier coup",
    "primarySlotNames": ["Chaussures magiques", "Livraison de biscuits", "Savoir cosmique"],
    "secondaryTree": "Resolve",
    "secondarySlotNames": ["Second souffle", "Surcroissance"],
    "comboTip": "Astuce cheese",
    "synergyHook": "Synergie cheese",
    "warningTrap": "Attention"
  }
]`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });
    if (!res.ok) throw new Error('Erreur client Gemini');
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return this.mapRawAiBuildsToLoLBuilds(champion, JSON.parse(jsonMatch[0]));
      }
    }
    return buildEngine.getFallbackExoticBuilds(champion, role as any);
  }
}

export const geminiService = new GeminiService();
