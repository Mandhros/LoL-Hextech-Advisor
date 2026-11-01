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
          const roles = this.inferRolesFromTags(raw.tags || []);
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
                name: 'Passif de combat inné',
                description: `Propriété passive unique de ${raw.name}. Modifie les attaques de base, les statistiques ou les capacités de combat.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: 'Passif permanent / Rechargement dynamique',
                cost: 'Pas de coût',
                range: raw.tags?.includes('Marksman') ? '550' : '175 (Mêlée)',
                ratios: raw.tags?.includes('Mage') ? '+25% AP' : '+15% AD total',
              },
              {
                id: `${id}Q`,
                key: 'Q',
                name: 'Sort Principal (A / Q)',
                description: `Compétence primaire offensive de ${raw.name}. Dégâts principaux et déclencheur d'escarmouche.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '8 / 7 / 6 / 5 / 4 s',
                cost: raw.stats.mp > 0 ? '50 / 60 / 70 / 80 / 90 Mana' : 'Sans coût / Énergie',
                range: raw.tags?.includes('Marksman') ? '800' : '350',
                ratios: raw.tags?.includes('Mage') ? '+70% / 85% AP' : '+110% / 140% AD total',
              },
              {
                id: `${id}W`,
                key: 'W',
                name: 'Sort Secondaire (Z / W)',
                description: `Compétence de contrôle, de mitigation ou d'utilité tactique pour ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '14 / 13 / 12 / 11 / 10 s',
                cost: raw.stats.mp > 0 ? '60 / 65 / 70 / 75 / 80 Mana' : 'Sans coût',
                range: raw.tags?.includes('Mage') ? '900' : '450',
                ratios: raw.tags?.includes('Tank') ? '+10% PV Max, +40% Armure' : raw.tags?.includes('Mage') ? '+65% AP' : '+80% AD bonus',
              },
              {
                id: `${id}E`,
                key: 'E',
                name: 'Mobilité & Dégâts (E)',
                description: `Sort de replacement, ruée, dash ou amplification de combat de ${raw.name}.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '16 / 15 / 14 / 13 / 12 s',
                cost: raw.stats.mp > 0 ? '50 / 55 / 60 / 65 / 70 Mana' : 'Sans coût',
                range: '450 - 650',
                ratios: raw.tags?.includes('Mage') ? '+60% AP' : '+90% AD bonus',
              },
              {
                id: `${id}R`,
                key: 'R',
                name: 'Ultime Dévastateur (R)',
                description: `Compétence ultime à fort impact pour renverser les combats d'équipe et sécuriser les éliminations.`,
                iconUrl: `https://ddragon.leagueoflegends.com/cdn/${this.currentVersion}/img/champion/${raw.image.full}`,
                cooldown: '120 / 100 / 80 s',
                cost: raw.stats.mp > 0 ? '100 Mana' : 'Sans coût',
                range: raw.tags?.includes('Marksman') || raw.tags?.includes('Mage') ? '1200+' : '600',
                ratios: raw.tags?.includes('Mage') ? '+100% / 120% AP' : '+150% AD bonus, +12% PV max',
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
