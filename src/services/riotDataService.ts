/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLChampion, LoLItem, LoLRole, RuneTreeKey } from '../types/lol';
import { STARTER_CHAMPIONS } from '../data/starterChampions';
import { STARTER_ITEMS, ALL_ITEMS_LIST } from '../data/starterItems';
import { RUNE_TREES_META } from '../data/starterRunes';

const CACHE_KEY_VERSION = 'lol_advisor_ddragon_version';
const CACHE_KEY_ITEMS = 'lol_advisor_items_cache';
const CACHE_KEY_RUNES = 'lol_advisor_runes_cache';
const DEFAULT_PATCH = '14.23.1';

class RiotDataService {
  private currentVersion: string = DEFAULT_PATCH;
  private champions: LoLChampion[] = STARTER_CHAMPIONS;
  private items: Record<string, LoLItem> = STARTER_ITEMS;
  private isLoaded: boolean = false;

  async init(forceRefresh: boolean = false): Promise<void> {
    if (this.isLoaded && !forceRefresh) return;

    try {
      // 1. Tenter de récupérer la dernière version de patch en direct
      const versionResp = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', { 
        cache: forceRefresh ? 'no-cache' : 'default' 
      })
        .then(r => r.json())
        .catch(() => null);

      if (versionResp && Array.isArray(versionResp) && versionResp.length > 0) {
        this.currentVersion = versionResp[0];
        localStorage.setItem(CACHE_KEY_VERSION, this.currentVersion);
      } else {
        const cachedVersion = localStorage.getItem(CACHE_KEY_VERSION);
        if (cachedVersion) this.currentVersion = cachedVersion;
      }

      // 2. Synchroniser les champions, items et runes en direct depuis le patch actif
      await Promise.allSettled([
        this.syncChampionsFromDDragon(forceRefresh),
        this.syncItemsFromDDragon(forceRefresh),
        this.syncRunesFromDDragon(forceRefresh),
      ]);
    } catch (e) {
      console.warn('RiotDataService: Utilisation du catalogue local de secours.', e);
    } finally {
      this.isLoaded = true;
    }
  }

  /**
   * Cartographie experte des rôles méta compétitifs pour éliminer les attributions erronées de Riot Tags
   */
  private static readonly META_ROLE_MAPPING: Record<string, LoLRole[]> = {
    // Toplaners primaires
    Aatrox: ['TOP'], Camille: ['TOP', 'SUPPORT'], Chogath: ['TOP', 'MID'], Darius: ['TOP'],
    DrMundo: ['TOP', 'JUNGLE'], Fiora: ['TOP'], Gangplank: ['TOP', 'MID'], Garen: ['TOP'],
    Gnar: ['TOP'], Gwen: ['TOP', 'JUNGLE'], Illaoi: ['TOP'], Irelia: ['TOP', 'MID'],
    Jax: ['TOP', 'JUNGLE'], Jayce: ['TOP', 'MID'], Kayle: ['TOP', 'MID'], Kennen: ['TOP'],
    Kled: ['TOP', 'MID'], Ksante: ['TOP'], Malphite: ['TOP', 'SUPPORT'], Mordekaiser: ['TOP', 'JUNGLE'],
    Nasus: ['TOP'], Olaf: ['TOP', 'JUNGLE'], Ornn: ['TOP'], Pantheon: ['TOP', 'MID', 'SUPPORT'],
    Poppy: ['TOP', 'JUNGLE', 'SUPPORT'], Quinn: ['TOP'], Renekton: ['TOP'], Riven: ['TOP'],
    Rumble: ['TOP', 'MID', 'JUNGLE'], Sett: ['TOP', 'SUPPORT'], Shen: ['TOP', 'SUPPORT'],
    Sion: ['TOP'], TahmKench: ['TOP', 'SUPPORT'], Teemo: ['TOP'], Trundle: ['TOP', 'JUNGLE'],
    Tryndamere: ['TOP', 'MID'], Urgot: ['TOP'], Volibear: ['TOP', 'JUNGLE'], Warwick: ['TOP', 'JUNGLE'],
    Yorick: ['TOP'],

    // Junglers primaires
    Amumu: ['JUNGLE', 'SUPPORT'], Belveth: ['JUNGLE'], Briar: ['JUNGLE'], Diana: ['JUNGLE', 'MID'],
    Ekko: ['JUNGLE', 'MID'], Elise: ['JUNGLE'], Evelynn: ['JUNGLE'], Fiddlesticks: ['JUNGLE'],
    Gragas: ['JUNGLE', 'TOP', 'MID'], Graves: ['JUNGLE'], Hecarim: ['JUNGLE'], Ivern: ['JUNGLE'],
    JarvanIV: ['JUNGLE'], Karthus: ['JUNGLE', 'BOTTOM'], Kayn: ['JUNGLE'], KhaZix: ['JUNGLE'],
    Kindred: ['JUNGLE'], LeeSin: ['JUNGLE'], Lillia: ['JUNGLE'], MasterYi: ['JUNGLE'],
    Nidalee: ['JUNGLE'], Nocturne: ['JUNGLE'], Nunu: ['JUNGLE'], Rammus: ['JUNGLE'],
    RekSai: ['JUNGLE'], Rengar: ['JUNGLE', 'TOP'], Sejuani: ['JUNGLE', 'TOP'], Shaco: ['JUNGLE', 'SUPPORT'],
    Shyvana: ['JUNGLE'], Skarner: ['JUNGLE', 'TOP'], Taliyah: ['JUNGLE', 'MID'], Udyr: ['JUNGLE', 'TOP'],
    Vi: ['JUNGLE'], Viego: ['JUNGLE'], Wukong: ['JUNGLE', 'TOP'], XinZhao: ['JUNGLE'], Zac: ['JUNGLE', 'TOP'],

    // Midlaners primaires
    Ahri: ['MID'], Akali: ['MID', 'TOP'], Akshan: ['MID', 'TOP'], Anivia: ['MID'],
    Annie: ['MID', 'SUPPORT'], AurelionSol: ['MID'], Azir: ['MID'], Cassiopeia: ['MID', 'TOP'],
    Corki: ['MID', 'BOTTOM'], Fizz: ['MID'], Galio: ['MID', 'SUPPORT'], Hwei: ['MID', 'SUPPORT'],
    Kassadin: ['MID'], Katarina: ['MID'], LeBlanc: ['MID'], Lissandra: ['MID'],
    Lux: ['MID', 'SUPPORT'], Malzahar: ['MID'], Neeko: ['MID', 'SUPPORT'], Orianna: ['MID'],
    Qiyana: ['MID'], Ryze: ['MID', 'TOP'], Swai: ['MID', 'SUPPORT', 'BOTTOM'], Swain: ['MID', 'SUPPORT', 'BOTTOM'],
    Sylas: ['MID', 'TOP', 'JUNGLE'], Syndra: ['MID'], Talon: ['MID', 'JUNGLE'], TwistedFate: ['MID', 'TOP'],
    Veigar: ['MID', 'BOTTOM'], Velkoz: ['MID', 'SUPPORT'], Vex: ['MID'], Viktor: ['MID'],
    Vladimir: ['MID', 'TOP'], Xerath: ['MID', 'SUPPORT'], Yasuo: ['MID', 'TOP'], Yone: ['MID', 'TOP'],
    Zed: ['MID', 'JUNGLE'], Zoe: ['MID'],

    // AD Carry / Botlane
    Aphelios: ['BOTTOM'], Ashe: ['BOTTOM', 'SUPPORT'], Caitlyn: ['BOTTOM'], Draven: ['BOTTOM'],
    Ezreal: ['BOTTOM'], Jhin: ['BOTTOM'], Jinx: ['BOTTOM'], Kaisa: ['BOTTOM'],
    Kalista: ['BOTTOM'], KogMaw: ['BOTTOM'], Lucian: ['BOTTOM', 'MID'], MissFortune: ['BOTTOM'],
    Nilah: ['BOTTOM'], Samira: ['BOTTOM'], Sivir: ['BOTTOM'], Smolder: ['BOTTOM', 'MID'],
    Tristana: ['BOTTOM', 'MID'], Twitch: ['BOTTOM', 'SUPPORT'], Varus: ['BOTTOM', 'MID'],
    Vayne: ['BOTTOM', 'TOP'], Xayah: ['BOTTOM'], Zeri: ['BOTTOM'], Ziggs: ['BOTTOM', 'MID'],

    // Supports
    Alistar: ['SUPPORT'], Bard: ['SUPPORT'], Blitzcrank: ['SUPPORT'], Brand: ['SUPPORT', 'JUNGLE', 'MID'],
    Braum: ['SUPPORT'], Janna: ['SUPPORT'], Karma: ['SUPPORT', 'MID'], Leona: ['SUPPORT'],
    Lulu: ['SUPPORT'], Mel: ['MID', 'SUPPORT'], Milio: ['SUPPORT'], Morgana: ['SUPPORT', 'JUNGLE'],
    Nami: ['SUPPORT'], Nautilus: ['SUPPORT'], Pyke: ['SUPPORT', 'MID'], Rakan: ['SUPPORT'],
    Rell: ['SUPPORT', 'JUNGLE'], Renata: ['SUPPORT'], Senna: ['SUPPORT', 'BOTTOM'], Seraphine: ['SUPPORT', 'BOTTOM', 'MID'],
    Sona: ['SUPPORT'], Soraka: ['SUPPORT'], Taric: ['SUPPORT'], Thresh: ['SUPPORT'], Yuumi: ['SUPPORT'],
    Zyra: ['SUPPORT', 'JUNGLE'],
  };

  /**
   * Synchronisation des champions officiels
   */
  private async syncChampionsFromDDragon(forceRefresh: boolean): Promise<void> {
    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/data/fr_FR/champion.json`;
      const res = await fetch(url, { cache: forceRefresh ? 'no-cache' : 'default' });
      if (!res.ok) return;

      const data = await res.json();
      if (!data?.data) return;

      const remoteChampsMap: Record<string, any> = data.data;
      const mergedList: LoLChampion[] = [...STARTER_CHAMPIONS];
      const existingIds = new Set(STARTER_CHAMPIONS.map(c => c.id));

      for (const [id, raw] of Object.entries(remoteChampsMap)) {
        if (!existingIds.has(id)) {
          const roles = RiotDataService.META_ROLE_MAPPING[id] || this.inferRolesFromTags(raw.tags || []);
          mergedList.push({
            id: raw.id,
            key: raw.key,
            name: raw.name,
            title: raw.title,
            blurb: raw.blurb,
            roles: roles,
            tags: raw.tags || ['Fighter'],
            iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
            splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${raw.id}_0.jpg`,
            stats: {
              hp: raw.stats.hp,
              hpperlevel: raw.stats.hpperlevel,
              mp: raw.stats.mp,
              armor: raw.stats.armor,
              armorperlevel: raw.stats.armorperlevel,
              spellblock: raw.stats.spellblock,
              attackdamage: raw.stats.attackdamage,
              attackdamageperlevel: raw.stats.attackdamageperlevel,
              attackspeed: raw.stats.attackspeed,
              movespeed: raw.stats.movespeed,
            },
            spells: [
              {
                id: `${id}P`,
                key: 'P',
                name: `Passif : ${raw.name}`,
                description: `Compétence passive de combat de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: 'Passif permanent',
                cost: 'Sans coût',
              },
              {
                id: `${id}Q`,
                key: 'Q',
                name: 'Sort A (Q)',
                description: `Compétence primaire de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '6s',
                cost: raw.stats.mp > 0 ? '50 Mana' : 'Sans coût',
              },
              {
                id: `${id}W`,
                key: 'W',
                name: 'Sort Z (W)',
                description: `Sort de contrôle ou de mitigation de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '12s',
                cost: raw.stats.mp > 0 ? '60 Mana' : 'Sans coût',
              },
              {
                id: `${id}E`,
                key: 'E',
                name: 'Sort E',
                description: `Mobilité ou utilitaire de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '14s',
                cost: raw.stats.mp > 0 ? '60 Mana' : 'Sans coût',
              },
              {
                id: `${id}R`,
                key: 'R',
                name: 'Ultime (R)',
                description: `Compétence ultime majeure de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '100s',
                cost: raw.stats.mp > 0 ? '100 Mana' : 'Sans coût',
              },
            ]
          });
        }
      }

      this.champions = mergedList;
    } catch (err) {
      console.warn('Erreur de parsing des champions DDragon:', err);
    }
  }

  /**
   * Charge à la demande les vrais sorts officiels avec noms, ratios et descriptions complètes
   */
  async fetchChampionDetailedSpells(championId: string): Promise<LoLChampion | undefined> {
    const champ = this.getChampionById(championId);
    if (!champ) return undefined;

    // Si les sorts ont déjà été hydratés (nom du passif ne commence pas par "Passif :")
    if (champ.spells && champ.spells.length >= 5 && !champ.spells[0].name.startsWith('Passif :')) {
      return champ;
    }

    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/data/fr_FR/champion/${champ.id}.json`;
      const res = await fetch(url);
      if (!res.ok) return champ;

      const data = await res.json();
      const detailed = data?.data?.[champ.id];
      if (!detailed) return champ;

      const keys: ('Q' | 'W' | 'E' | 'R')[] = ['Q', 'W', 'E', 'R'];
      const realSpells = [
        {
          id: `${champ.id}P`,
          key: 'P' as const,
          name: detailed.passive?.name || `Passif : ${champ.name}`,
          description: this.cleanRiotItemDescription(detailed.passive?.description || ''),
          iconUrl: detailed.passive?.image?.full 
            ? `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/passive/${detailed.passive.image.full}`
            : champ.iconUrl,
          cooldown: 'Passif permanent',
          cost: 'Sans coût',
        },
        ...detailed.spells.map((s: any, idx: number) => ({
          id: `${champ.id}${keys[idx] || 'Q'}`,
          key: keys[idx] || ('Q' as const),
          name: s.name,
          description: this.cleanRiotItemDescription(s.description || ''),
          iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/spell/${s.image.full}`,
          cooldown: s.cooldownBurn ? `${s.cooldownBurn} s` : undefined,
          cost: s.costBurn ? `${s.costBurn} ${champ.stats.mp > 0 ? 'Mana' : ''}` : undefined,
          range: s.rangeBurn ? `${s.rangeBurn}` : undefined,
        }))
      ];

      champ.spells = realSpells;
      return champ;
    } catch (e) {
      console.warn(`Impossible de charger les sorts détaillés de ${champ.name}:`, e);
      return champ;
    }
  }

  /**
   * Synchronisation des objets officiels (Item.json) pour résister aux refontes LoL
   */
  private async syncItemsFromDDragon(forceRefresh: boolean): Promise<void> {
    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/data/fr_FR/item.json`;
      const res = await fetch(url, { cache: forceRefresh ? 'no-cache' : 'default' });
      if (!res.ok) return;

      const data = await res.json();
      if (!data?.data) return;

      const remoteItems: Record<string, any> = data.data;
      const newItemsMap: Record<string, LoLItem> = { ...STARTER_ITEMS };
      const starterItemIds = new Set(Object.values(STARTER_ITEMS).map(i => i.id));

      for (const [id, itemData] of Object.entries(remoteItems)) {
        // Filtrer les objets non achetables sur la Faille de l'Invocateur
        if (!itemData.gold?.purchasable || itemData.gold.total < 300) continue;
        if (itemData.maps && !itemData.maps['11']) continue;

        // Si l'objet est déjà documenté dans notre catalogue soigné, conserver la description impeccable
        if (starterItemIds.has(id)) {
          continue;
        }

        const cleanDesc = this.cleanRiotItemDescription(itemData.description || itemData.plaintext || '');

        newItemsMap[id] = {
          id: id,
          name: itemData.name,
          description: cleanDesc || itemData.plaintext || 'Objet de combat League of Legends.',
          gold: itemData.gold.total,
          tags: itemData.tags || ['Damage'],
          iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/item/${id}.png`,
          stats: itemData.stats || {},
          isBoots: itemData.tags?.includes('Boots'),
          isStarter: itemData.gold.total <= 500,
        };
      }

      this.items = newItemsMap;
    } catch (err) {
      console.warn('Erreur sync items DDragon:', err);
    }
  }

  /**
   * Synchronisation des runes officielles (runesReforged.json) pour corriger les icônes obsolètes
   */
  private async syncRunesFromDDragon(forceRefresh: boolean): Promise<void> {
    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/data/fr_FR/runesReforged.json`;
      const res = await fetch(url, { cache: forceRefresh ? 'no-cache' : 'default' });
      if (!res.ok) return;

      const data = await res.json();
      if (!Array.isArray(data)) return;

      for (const tree of data) {
        const key = tree.key as RuneTreeKey;
        if (RUNE_TREES_META[key]) {
          RUNE_TREES_META[key].iconUrl = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`;
          
          // Mettre à jour les keystones réelles avec leurs icônes exactes du patch
          if (tree.slots && tree.slots[0] && Array.isArray(tree.slots[0].runes)) {
            RUNE_TREES_META[key].keystones = tree.slots[0].runes.map((r: any) => ({
              name: r.name,
              iconUrl: `https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`,
              description: (r.shortDesc || r.longDesc || '').replace(/<[^>]*>/g, ' ').trim(),
            }));
          }

          // Mettre à jour les slots mineurs
          const allMinorSlots: { name: string; iconUrl: string; description: string }[] = [];
          for (let i = 1; i < tree.slots.length; i++) {
            if (tree.slots[i] && Array.isArray(tree.slots[i].runes)) {
              for (const r of tree.slots[i].runes) {
                allMinorSlots.push({
                  name: r.name,
                  iconUrl: `https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`,
                  description: (r.shortDesc || r.longDesc || '').replace(/<[^>]*>/g, ' ').trim(),
                });
              }
            }
          }
          if (allMinorSlots.length > 0) {
            RUNE_TREES_META[key].slots = allMinorSlots;
          }
        }
      }
    } catch (err) {
      console.warn('Erreur sync runes DDragon:', err);
    }
  }

  /**
   * Nettoie les balises HTML/XML spécifiques de Riot (<stats>, <attention>, <passive>, <active>, <br>, etc.)
   * et formate proprement la description de l'objet sans balises corrompues.
   */
  private cleanRiotItemDescription(raw: string): string {
    if (!raw) return '';

    return raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<li>/gi, ' • ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<stats>/gi, '')
      .replace(/<\/stats>/gi, '\n')
      .replace(/<attention>/gi, '')
      .replace(/<\/attention>/gi, '')
      .replace(/<passive>/gi, 'Passif : ')
      .replace(/<\/passive>/gi, ' ')
      .replace(/<active>/gi, 'Actif : ')
      .replace(/<\/active>/gi, ' ')
      .replace(/<rules>/gi, '(')
      .replace(/<\/rules>/gi, ')')
      .replace(/<scaleAP>/gi, '(+AP)')
      .replace(/<\/scaleAP>/gi, '')
      .replace(/<scaleAD>/gi, '(+AD)')
      .replace(/<\/scaleAD>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\n\s*\n+/g, '\n')
      .trim();
  }

  private inferRolesFromTags(tags: string[]): LoLRole[] {
    const roles: LoLRole[] = [];
    if (tags.includes('Marksman')) roles.push('BOTTOM');
    if (tags.includes('Support')) roles.push('SUPPORT');
    if (tags.includes('Mage')) roles.push('MID');
    if (tags.includes('Assassin')) roles.push('MID', 'JUNGLE');
    if (tags.includes('Tank')) roles.push('TOP', 'SUPPORT');
    if (tags.includes('Fighter')) roles.push('TOP', 'JUNGLE');

    if (roles.length === 0) roles.push('TOP');
    return Array.from(new Set(roles));
  }

  getVersion(): string {
    return this.currentVersion;
  }

  getAllChampions(): LoLChampion[] {
    return this.champions;
  }

  getChampionById(id: string | number): LoLChampion | undefined {
    if (id === undefined || id === null || id === 0 || id === '0') return undefined;
    const strId = String(id).toLowerCase();
    return this.champions.find(c => 
      c.id.toLowerCase() === strId || 
      c.name.toLowerCase() === strId || 
      c.key === String(id)
    );
  }

  getAllItems(): LoLItem[] {
    return Object.values(this.items);
  }

  getItemById(idOrName: string): LoLItem | undefined {
    if (!idOrName) return undefined;
    const direct = this.items[idOrName];
    if (direct) return direct;
    const all = Object.values(this.items);
    return all.find(i => 
      i.id === idOrName || 
      i.name.toLowerCase() === idOrName.toLowerCase() ||
      i.name.toLowerCase().includes(idOrName.toLowerCase())
    );
  }
}

export const riotDataService = new RiotDataService();
