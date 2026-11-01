/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DraftArena, ActiveSlotType } from './components/DraftArena';
import { ChampionGrid } from './components/ChampionGrid';
import { BuildsViewer } from './components/BuildsViewer';
import { StatsExplorer } from './components/StatsExplorer';
import { DraftSuggestionsModal } from './components/DraftSuggestionsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GitHubPagesGuideModal } from './components/GitHubPagesGuideModal';
import { LcuSyncModal } from './components/LcuSyncModal';
import { DpmMatchupCard } from './components/DpmMatchupCard';

import { LoLChampion, LoLRole, DraftState, LoLBuild, DraftSuggestion, CoachDraftDiagnosis } from './types/lol';
import { riotDataService } from './services/riotDataService';
import { buildEngine } from './services/buildEngine';
import { geminiService } from './services/geminiService';
import { soundEffects } from './utils/audio';

import { Shield, RefreshCw } from 'lucide-react';

export default function App() {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [patchVersion, setPatchVersion] = useState('14.23.1');
  const [activeView, setActiveView] = useState<'draft' | 'builds' | 'stats'>('draft');
  const [isSyncingPatch, setIsSyncingPatch] = useState(false);

  // Draft 5v5 State avec Picks et 10 Bans
  const [draft, setDraft] = useState<DraftState>({
    playerRole: 'MID',
    playerChampion: null,
    allies: {
      TOP: null,
      JUNGLE: null,
      MID: null,
      BOTTOM: null,
      SUPPORT: null,
    },
    enemies: {
      TOP: null,
      JUNGLE: null,
      MID: null,
      BOTTOM: null,
      SUPPORT: null,
    },
    bans: {
      blue: [null, null, null, null, null],
      red: [null, null, null, null, null],
    },
  });

  // Slot en cours de sélection (Pick ou Ban)
  const [activeSlot, setActiveSlot] = useState<ActiveSlotType | null>({
    type: 'pick',
    team: 'allies',
    role: 'MID',
  });

  // Builds actuels
  const [builds, setBuilds] = useState<LoLBuild[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Modals
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [draftSuggestions, setDraftSuggestions] = useState<DraftSuggestion[]>([]);
  const [coachDiagnosis, setCoachDiagnosis] = useState<CoachDraftDiagnosis | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isLcuModalOpen, setIsLcuModalOpen] = useState(false);

  // Initialisation des données au montage
  useEffect(() => {
    async function loadData() {
      await riotDataService.init();
      setPatchVersion(riotDataService.getVersion());

      // Initialiser avec des champions de départ pour une expérience immédiate
      const aatrox = riotDataService.getChampionById('Aatrox') || null;
      const leeSin = riotDataService.getChampionById('LeeSin') || null;
      const yasuo = riotDataService.getChampionById('Yasuo') || null;
      const jinx = riotDataService.getChampionById('Jinx') || null;
      const thresh = riotDataService.getChampionById('Thresh') || null;

      const darius = riotDataService.getChampionById('Darius') || null;
      const zac = riotDataService.getChampionById('Zac') || null;
      const ahri = riotDataService.getChampionById('Ahri') || null;
      const kaisa = riotDataService.getChampionById('Kaisa') || null;
      const nautilus = riotDataService.getChampionById('Nautilus') || null;

      const jax = riotDataService.getChampionById('Jax') || null;
      const viego = riotDataService.getChampionById('Viego') || null;
      const sylas = riotDataService.getChampionById('Sylas') || null;

      const initialDraft: DraftState = {
        playerRole: 'MID',
        playerChampion: yasuo,
        allies: {
          TOP: aatrox,
          JUNGLE: leeSin,
          MID: yasuo,
          BOTTOM: jinx,
          SUPPORT: thresh,
        },
        enemies: {
          TOP: darius,
          JUNGLE: zac,
          MID: ahri,
          BOTTOM: kaisa,
          SUPPORT: nautilus,
        },
        bans: {
          blue: [jax, null, null, null, null],
          red: [viego, sylas, null, null, null],
        },
      };

      setDraft(initialDraft);
      setIsDataLoaded(true);

      // Calculer les builds pour le champion du joueur (Yasuo)
      if (yasuo) {
        generateAllBuilds(yasuo, initialDraft);
      }
    }

    loadData();
  }, []);

  // Forcer la synchronisation avec le tout dernier patch Riot Games
  const handleForceSyncRiotPatch = async () => {
    setIsSyncingPatch(true);
    soundEffects.playSelect();
    try {
      await riotDataService.init(true);
      setPatchVersion(riotDataService.getVersion());
      if (draft.playerChampion) {
        generateAllBuilds(draft.playerChampion, draft);
      }
    } catch (err) {
      console.warn('Erreur lors du rafraîchissement du patch Riot:', err);
    } finally {
      setIsSyncingPatch(false);
    }
  };

  // Ensembles des champions déjà sélectionnés et bannis
  const pickedChampionIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(draft.allies).forEach(c => { if (c) ids.add(c.id); });
    Object.values(draft.enemies).forEach(c => { if (c) ids.add(c.id); });
    return ids;
  }, [draft.allies, draft.enemies]);

  const bannedChampionIds = useMemo(() => {
    const ids = new Set<string>();
    (draft.bans.blue || []).forEach(c => { if (c) ids.add(c.id); });
    (draft.bans.red || []).forEach(c => { if (c) ids.add(c.id); });
    return ids;
  }, [draft.bans]);

  // Analyse en direct de la composition
  const compAnalysis = useMemo(() => {
    return buildEngine.analyzeComp(draft);
  }, [draft]);

  // Génération instantanée et locale des 5 builds (SANS aucun appel réseau ni API automatique)
  const generateAllBuilds = useCallback((champ: LoLChampion, currentDraft: DraftState, targetRole?: LoLRole) => {
    if (!champ) return;
    const effectiveRole = targetRole || currentDraft.playerRole;

    // Hydrater à la demande les vrais sorts officiels du champion depuis DDragon
    riotDataService.fetchChampionDetailedSpells(champ.id).catch(() => {});

    // 1. Builds 1 (Méta Pure), 2 (Orienté Défense), 3 (Orienté Offensif) immédiats adaptés à la lane
    const baseBuilds = buildEngine.generateAlgorithmicBuilds(champ, currentDraft, effectiveRole);
    // 2. Builds 4 (Exotique Viable) et 5 (Signature Cheese) issus de la base theorycrafting hors-ligne
    const fallbacks = buildEngine.getFallbackExoticBuilds(champ, effectiveRole);
    setBuilds([...baseBuilds, ...fallbacks]);
  }, []);

  // Optimisation manuelle et ciblée via l'IA Gemini (déclenchée UNIQUEMENT sur clic explicite de l'utilisateur)
  const handleOptimizeWithAi = useCallback(async () => {
    if (!draft.playerChampion || isGeneratingAi) return;
    soundEffects.playSelect();
    setIsGeneratingAi(true);

    try {
      const currentCompAnalysis = buildEngine.analyzeComp(draft);
      const aiExoticBuilds = await geminiService.generateExoticBuilds(
        draft.playerChampion,
        draft.playerRole,
        draft,
        currentCompAnalysis
      );

      if (aiExoticBuilds && aiExoticBuilds.length >= 2) {
        setBuilds(prev => {
          const base = prev.slice(0, 3);
          return [...base, aiExoticBuilds[0], aiExoticBuilds[1]];
        });
      }
    } catch (err) {
      console.warn('Erreur optimisation manuelle Gemini:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  }, [draft, isGeneratingAi]);

  // Réinitialiser / Clean toute la Champion Select
  const handleResetDraft = () => {
    soundEffects.playSelect();
    const emptyDraft: DraftState = {
      playerRole: draft.playerRole,
      playerChampion: null,
      allies: {
        TOP: null,
        JUNGLE: null,
        MID: null,
        BOTTOM: null,
        SUPPORT: null,
      },
      enemies: {
        TOP: null,
        JUNGLE: null,
        MID: null,
        BOTTOM: null,
        SUPPORT: null,
      },
      bans: {
        blue: [null, null, null, null, null],
        red: [null, null, null, null, null],
      },
    };
    setDraft(emptyDraft);
    setBuilds([]);
    setActiveSlot({ type: 'pick', team: 'allies', role: draft.playerRole });
  };

  // Gestion du clic sur un slot de pick
  const handleSelectPickSlot = (team: 'allies' | 'enemies', role: LoLRole) => {
    setActiveSlot({ type: 'pick', team, role });
  };

  // Vider un slot de pick individuel
  const handleClearPickSlot = (team: 'allies' | 'enemies', role: LoLRole, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playSelect();

    setDraft(prev => {
      const newDraft = {
        ...prev,
        [team]: {
          ...prev[team],
          [role]: null,
        }
      };
      if (team === 'allies' && prev.playerRole === role) {
        newDraft.playerChampion = null;
      }
      return newDraft;
    });
  };

  // Gestion du clic sur un slot de ban
  const handleSelectBanSlot = (team: 'blue' | 'red', index: number) => {
    setActiveSlot({ type: 'ban', team, index });
  };

  // Vider un slot de ban individuel
  const handleClearBanSlot = (team: 'blue' | 'red', index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playSelect();

    setDraft(prev => {
      const newBans = [...prev.bans[team]];
      newBans[index] = null;
      return {
        ...prev,
        bans: {
          ...prev.bans,
          [team]: newBans,
        }
      };
    });
  };

  // Changement du rôle du joueur (depuis le simulateur de draft ou directement sur la page des builds)
  const handleChangePlayerRole = (role: LoLRole) => {
    soundEffects.playSelect();
    setDraft(prev => {
      // Conserver le champion actuel du joueur ou récupérer le champion déjà assigné à ce rôle
      const champToUse = prev.playerChampion || prev.allies[role];
      const newAllies = {
        ...prev.allies,
        ...(champToUse ? { [role]: champToUse } : {})
      };
      const newDraft: DraftState = {
        ...prev,
        playerRole: role,
        allies: newAllies,
        playerChampion: champToUse,
      };
      if (champToUse) {
        generateAllBuilds(champToUse, newDraft, role);
      }
      return newDraft;
    });

    setActiveSlot({ type: 'pick', team: 'allies', role });
  };

  // Assignation d'un champion depuis la grille ou depuis la frappe directe dans un slot (Pick ou Ban)
  const handleAssignChampion = (champ: LoLChampion, customSlot?: ActiveSlotType) => {
    const slotToAssign = customSlot || activeSlot;
    if (!slotToAssign) return;

    soundEffects.playLockIn();

    if (slotToAssign.type === 'pick') {
      setDraft(prev => {
        const updatedTeam = {
          ...prev[slotToAssign.team],
          [slotToAssign.role]: champ,
        };

        const isPlayerSlot = slotToAssign.team === 'allies' && slotToAssign.role === prev.playerRole;
        const updatedPlayerChamp = isPlayerSlot ? champ : prev.playerChampion;

        const newDraft: DraftState = {
          ...prev,
          [slotToAssign.team]: updatedTeam,
          playerChampion: updatedPlayerChamp,
        };

        if (isPlayerSlot) {
          generateAllBuilds(champ, newDraft);
        }

        return newDraft;
      });
    } else if (slotToAssign.type === 'ban') {
      setDraft(prev => {
        const newBans = [...prev.bans[slotToAssign.team]];
        newBans[slotToAssign.index] = champ;
        return {
          ...prev,
          bans: {
            ...prev.bans,
            [slotToAssign.team]: newBans,
          }
        };
      });
    }
  };

  // Ouvrir les suggestions de draft via le Coach Virtuel des Worlds
  const handleOpenDraftSuggestions = async () => {
    setIsSuggestionsModalOpen(true);
    setIsLoadingSuggestions(true);
    try {
      const results = await geminiService.getDraftSuggestionsWithDiagnosis(
        draft.playerRole,
        draft.allies,
        draft.enemies,
        draft.bans
      );
      setDraftSuggestions(results.suggestions);
      setCoachDiagnosis(results.diagnosis);
    } catch (err) {
      console.warn('Erreur suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Sélectionner un champion depuis les suggestions de draft
  const handleSelectFromSuggestions = (champ: LoLChampion) => {
    soundEffects.playLockIn();

    setDraft(prev => {
      const newAllies = {
        ...prev.allies,
        [prev.playerRole]: champ,
      };

      const newDraft: DraftState = {
        ...prev,
        allies: newAllies,
        playerChampion: champ,
      };

      generateAllBuilds(champ, newDraft);
      return newDraft;
    });

    setActiveSlot({ type: 'pick', team: 'allies', role: draft.playerRole });
  };

  // Application de la draft synchronisée depuis le client League of Legends (LCU)
  const handleApplyLcuDraft = (syncedDraft: DraftState) => {
    setDraft(syncedDraft);
    if (syncedDraft.playerChampion) {
      generateAllBuilds(syncedDraft.playerChampion, syncedDraft, syncedDraft.playerRole);
    }
  };

  // Sélection d'un champion depuis l'explorateur de stats vers les builds
  const handleSelectChampFromStats = (champ: LoLChampion) => {
    setDraft(prev => {
      const newAllies = {
        ...prev.allies,
        [prev.playerRole]: champ,
      };
      const newDraft = {
        ...prev,
        allies: newAllies,
        playerChampion: champ,
      };
      generateAllBuilds(champ, newDraft);
      return newDraft;
    });
    setActiveView('builds');
  };

  // Bouton "Générer les 5 Builds"
  const handleGenerateBuildsClick = () => {
    if (draft.playerChampion) {
      generateAllBuilds(draft.playerChampion, draft);
      setActiveView('builds');
    } else {
      setActiveSlot({ type: 'pick', team: 'allies', role: draft.playerRole });
    }
  };

  const allChampions = riotDataService.getAllChampions();
  const allItems = riotDataService.getAllItems();

  const activeSlotDescription = activeSlot
    ? activeSlot.type === 'pick'
      ? `${activeSlot.team === 'allies' ? 'Équipe Bleue (Allié)' : 'Équipe Rouge (Ennemi)'} · ${activeSlot.role}`
      : `Bannir pour l'Équipe ${activeSlot.team === 'blue' ? 'Bleue' : 'Rouge'} (Slot #${activeSlot.index + 1})`
    : 'Sélectionner un champion';

  const isBanSlotActive = activeSlot?.type === 'ban';

  const currentSlotChampion = activeSlot
    ? activeSlot.type === 'pick'
      ? draft[activeSlot.team][activeSlot.role]
      : draft.bans[activeSlot.team][activeSlot.index]
    : null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Header Contract */}
      <Header
        patchVersion={patchVersion}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenLcuModal={() => setIsLcuModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* View Switcher: Draft vs 5 Builds vs InGame vs Stats */}
        {activeView === 'draft' ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Draft 5v5 Arena Board & Bans */}
            <DraftArena
              draft={draft}
              activeSlot={activeSlot}
              compAnalysis={compAnalysis}
              allChampions={allChampions}
              pickedChampionIds={pickedChampionIds}
              bannedChampionIds={bannedChampionIds}
              onSelectPickSlot={handleSelectPickSlot}
              onClearPickSlot={handleClearPickSlot}
              onSelectBanSlot={handleSelectBanSlot}
              onClearBanSlot={handleClearBanSlot}
              onAssignChampion={handleAssignChampion}
              onResetDraft={handleResetDraft}
              onChangePlayerRole={handleChangePlayerRole}
              onOpenDraftSuggestions={handleOpenDraftSuggestions}
              onGenerateBuilds={handleGenerateBuildsClick}
              onOpenLcuModal={() => setIsLcuModalOpen(true)}
            />

            {/* Matrice de Matchup & DPM Direct Inspirée de DPM.LOL */}
            {draft.playerChampion && draft.enemies[draft.playerRole] && (
              <DpmMatchupCard
                playerChampion={draft.playerChampion}
                enemyChampion={draft.enemies[draft.playerRole]}
                role={draft.playerRole}
              />
            )}

            {/* Champion Picker Grid avec détection des champions pris ou bannis */}
            <ChampionGrid
              champions={allChampions}
              selectedChampion={currentSlotChampion}
              pickedChampionIds={pickedChampionIds}
              bannedChampionIds={bannedChampionIds}
              onSelectChampion={handleAssignChampion}
              activeSlotDescription={activeSlotDescription}
              isBanSlotActive={isBanSlotActive}
            />
          </div>
        ) : activeView === 'builds' ? (
          /* Builds Viewer */
          <div className="space-y-6 animate-in fade-in">
            {draft.playerChampion ? (
              <BuildsViewer
                champion={draft.playerChampion}
                currentRole={draft.playerRole}
                onSelectRole={handleChangePlayerRole}
                builds={builds}
                isGeneratingAi={isGeneratingAi}
                onRegenerateAiBuilds={handleOptimizeWithAi}
              />
            ) : (
              <div className="bg-[#091428] border border-slate-800 rounded-xl p-12 text-center space-y-4">
                <Shield className="w-12 h-12 text-[#C8AA6E] mx-auto opacity-60" />
                <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech">
                  Aucun champion assigné pour votre rôle ({draft.playerRole})
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Sélectionnez un champion dans le simulateur de draft pour afficher ses 5 builds adaptatifs et synergies exotiques Gemini.
                </p>
                <button
                  onClick={() => { soundEffects.playSelect(); setActiveView('draft'); }}
                  className="px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] rounded-lg transition-all"
                >
                  Retourner au Simulateur
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Stats & Items Explorer View */
          <div className="space-y-6 animate-in fade-in">
            <StatsExplorer
              champions={allChampions}
              items={allItems}
              onSelectChampionForBuild={handleSelectChampFromStats}
            />
          </div>
        )}

      </main>

      {/* Modals */}
      <DraftSuggestionsModal
        isOpen={isSuggestionsModalOpen}
        role={draft.playerRole}
        suggestions={draftSuggestions}
        diagnosis={coachDiagnosis}
        isLoading={isLoadingSuggestions}
        onClose={() => setIsSuggestionsModalOpen(false)}
        onRefresh={handleOpenDraftSuggestions}
        onSelectChampion={handleSelectFromSuggestions}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <GitHubPagesGuideModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      <LcuSyncModal
        isOpen={isLcuModalOpen}
        onClose={() => setIsLcuModalOpen(false)}
        onApplyDraft={handleApplyLcuDraft}
      />

      {/* Footer avec accès discret Déploiement GitHub et synchronisation Riot */}
      <footer className="mt-auto py-6 border-t border-slate-900 bg-[#02050B] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-hextech text-slate-400 font-bold">LoL Hextech Advisor</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-[#0AC8B9]">Patch Riot {patchVersion}</span>
            <span>·</span>
            <span>Data Dragon & Gemini 3.8 Flash</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleForceSyncRiotPatch}
              disabled={isSyncingPatch}
              className="hover:text-[#0AC8B9] transition-colors flex items-center gap-1"
              title="Forcer la mise à jour des champions, items et runes depuis le dernier patch Riot Games"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingPatch ? 'animate-spin text-[#0AC8B9]' : ''}`} />
              <span>{isSyncingPatch ? 'Actualisation...' : 'Synchroniser Patch Riot'}</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsLcuModalOpen(true)}
              className="hover:text-[#0AC8B9] transition-colors"
              title="Connecter et pré-remplir la phase de draft depuis le client officiel League of Legends"
            >
              Sync Client LoL (LCU)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Déploiement GitHub Pages
            </button>
            <span>·</span>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Clé Gemini
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
