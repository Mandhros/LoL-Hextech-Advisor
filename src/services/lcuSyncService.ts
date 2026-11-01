/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DraftState, LoLChampion, LoLRole } from '../types/lol';
import { riotDataService } from './riotDataService';

export interface LcuSyncResult {
  success: boolean;
  message: string;
  draft?: DraftState;
}

export class LcuSyncService {
  private isPolling = false;
  private pollInterval: any = null;

  /**
   * Convertit la position LCU Riot officielle en LoLRole
   */
  private mapLcuPositionToRole(pos: string, indexFallback: number): LoLRole {
    const p = (pos || '').toUpperCase();
    if (p === 'TOP') return 'TOP';
    if (p === 'JUNGLE') return 'JUNGLE';
    if (p === 'MIDDLE' || p === 'MID') return 'MID';
    if (p === 'BOTTOM' || p === 'BOT' || p === 'ADC') return 'BOTTOM';
    if (p === 'UTILITY' || p === 'SUPPORT' || p === 'SUPP') return 'SUPPORT';

    // Fallback par ordre standard si position non attribuée (ex: Blind Pick)
    const defaultOrder: LoLRole[] = ['TOP', 'JUNGLE', 'MID', 'BOTTOM', 'SUPPORT'];
    return defaultOrder[indexFallback] || 'MID';
  }

  /**
   * Analyse et parse l'objet JSON retourné par l'endpoint LCU officiel :
   * /lol-champ-select/v1/session
   */
  parseLcuSession(sessionData: any): LcuSyncResult {
    try {
      if (!sessionData || typeof sessionData !== 'object') {
        return { success: false, message: 'Données de session invalides ou vides.' };
      }

      // Initialiser la draft vide
      const newDraft: DraftState = {
        playerRole: 'MID',
        playerChampion: null,
        allies: { TOP: null, JUNGLE: null, MID: null, BOTTOM: null, SUPPORT: null },
        enemies: { TOP: null, JUNGLE: null, MID: null, BOTTOM: null, SUPPORT: null },
        bans: {
          blue: [null, null, null, null, null],
          red: [null, null, null, null, null],
        },
      };

      const localCellId = sessionData.localPlayerCellId;
      let detectedPlayerRole: LoLRole = 'MID';
      let detectedPlayerChamp: LoLChampion | null = null;

      // 1. Parsing de l'équipe alliée (myTeam)
      const myTeam = Array.isArray(sessionData.myTeam) ? sessionData.myTeam : [];
      myTeam.forEach((member: any, idx: number) => {
        const role = this.mapLcuPositionToRole(member.assignedPosition, idx);
        const champId = member.championId || member.championPickIntent;
        const champ = champId ? riotDataService.getChampionById(champId) : null;

        if (champ) {
          newDraft.allies[role] = champ;
        }

        if (member.cellId === localCellId) {
          detectedPlayerRole = role;
          if (champ) detectedPlayerChamp = champ;
        }
      });

      // 2. Parsing de l'équipe ennemie (theirTeam)
      const theirTeam = Array.isArray(sessionData.theirTeam) ? sessionData.theirTeam : [];
      theirTeam.forEach((member: any, idx: number) => {
        const role = this.mapLcuPositionToRole(member.assignedPosition, idx);
        const champId = member.championId;
        const champ = champId ? riotDataService.getChampionById(champId) : null;

        if (champ) {
          newDraft.enemies[role] = champ;
        }
      });

      // 3. Parsing des Bans
      const bans = sessionData.bans || {};
      const myBans = Array.isArray(bans.myTeamBans) ? bans.myTeamBans : [];
      const theirBans = Array.isArray(bans.theirTeamBans) ? bans.theirTeamBans : [];

      myBans.slice(0, 5).forEach((champId: number, idx: number) => {
        if (champId > 0) {
          newDraft.bans.blue[idx] = riotDataService.getChampionById(champId) || null;
        }
      });

      theirBans.slice(0, 5).forEach((champId: number, idx: number) => {
        if (champId > 0) {
          newDraft.bans.red[idx] = riotDataService.getChampionById(champId) || null;
        }
      });

      newDraft.playerRole = detectedPlayerRole;
      newDraft.playerChampion = detectedPlayerChamp || newDraft.allies[detectedPlayerRole];

      const allyCount = Object.values(newDraft.allies).filter(Boolean).length;
      const enemyCount = Object.values(newDraft.enemies).filter(Boolean).length;
      const banCount = [...newDraft.bans.blue, ...newDraft.bans.red].filter(Boolean).length;

      return {
        success: true,
        message: `Draft synchronisée avec succès : ${allyCount} alliés, ${enemyCount} ennemis, ${banCount} bans détectés. Rôle : ${detectedPlayerRole}.`,
        draft: newDraft,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Erreur lors de l'analyse de la session LCU : ${err.message || 'Format non reconnu'}`,
      };
    }
  }

  /**
   * Tente une connexion au pont local léger (Bridge local ws/http si actif sur le PC de l'utilisateur)
   */
  async fetchFromLocalBridge(bridgePort = 35199): Promise<LcuSyncResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://127.0.0.1:${bridgePort}/session`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        return this.parseLcuSession(json);
      }
      return { success: false, message: 'Le pont local LCU a répondu avec une erreur.' };
    } catch {
      return {
        success: false,
        message: 'Pont local non détecté. Lancez le script compagnon ou collez votre session manuellement.',
      };
    }
  }

  /**
   * Exemple de session LCU réaliste pour tester instantanément
   */
  getDemoLcuSession(): any {
    return {
      gameId: 6984210345,
      localPlayerCellId: 2,
      myTeam: [
        { cellId: 0, assignedPosition: 'TOP', championId: 266, championPickIntent: 266 }, // Aatrox
        { cellId: 1, assignedPosition: 'JUNGLE', championId: 64, championPickIntent: 64 }, // Lee Sin
        { cellId: 2, assignedPosition: 'MIDDLE', championId: 157, championPickIntent: 157 }, // Yasuo (Player)
        { cellId: 3, assignedPosition: 'BOTTOM', championId: 222, championPickIntent: 222 }, // Jinx
        { cellId: 4, assignedPosition: 'UTILITY', championId: 412, championPickIntent: 412 }, // Thresh
      ],
      theirTeam: [
        { cellId: 5, assignedPosition: 'TOP', championId: 122 }, // Darius
        { cellId: 6, assignedPosition: 'JUNGLE', championId: 154 }, // Zac
        { cellId: 7, assignedPosition: 'MIDDLE', championId: 103 }, // Ahri
        { cellId: 8, assignedPosition: 'BOTTOM', championId: 145 }, // Kaisa
        { cellId: 9, assignedPosition: 'UTILITY', championId: 111 }, // Nautilus
      ],
      bans: {
        myTeamBans: [24, 238, 0, 0, 0], // Jax, Zed
        theirTeamBans: [234, 517, 0, 0, 0], // Viego, Sylas
      },
    };
  }
}

export const lcuSyncService = new LcuSyncService();
