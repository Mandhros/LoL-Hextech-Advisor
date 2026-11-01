/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LoLRole, LoLChampion, DraftState, CompAnalysis } from '../types/lol';
import { Shield, Swords, Wand2, X, Sparkles, Ban, Trash2, Search, CornerDownLeft, Edit3 } from 'lucide-react';
import { LoLImage } from './LoLImage';
import { soundEffects } from '../utils/audio';

const ROLES: { key: LoLRole; label: string; icon: string }[] = [
  { key: 'TOP', label: 'Toplane', icon: '🛡️' },
  { key: 'JUNGLE', label: 'Jungle', icon: '🌲' },
  { key: 'MID', label: 'Midlane', icon: '⚡' },
  { key: 'BOTTOM', label: 'ADC / Bot', icon: '🏹' },
  { key: 'SUPPORT', label: 'Support', icon: '🤝' },
];

export type ActiveSlotType = 
  | { type: 'pick'; team: 'allies' | 'enemies'; role: LoLRole }
  | { type: 'ban'; team: 'blue' | 'red'; index: number };

// Dictionnaire d'alias et abréviations populaires dans LoL
const CHAMPION_ALIASES: Record<string, string[]> = {
  AurelionSol: ['asol'],
  MissFortune: ['mf'],
  TwistedFate: ['tf'],
  MasterYi: ['yi'],
  TahmKench: ['tk'],
  Warwick: ['ww'],
  Gangplank: ['gp'],
  DrMundo: ['mundo', 'drmundo', 'doc'],
  JarvanIV: ['j4', 'jarvan', 'jarvan4'],
  Nunu: ['nunuwillump', 'willump'],
  MonkeyKing: ['wukong', 'wu'],
  Renata: ['glasc', 'renataglasc'],
  XinZhao: ['xin'],
  Blitzcrank: ['blitz'],
  Caitlyn: ['cait'],
  Morgana: ['morg'],
  Cassiopeia: ['cass'],
  Fiddlesticks: ['fiddle', 'fidd'],
  Hecarim: ['heca'],
  Heimerdinger: ['heimer', 'donger'],
  Kassadin: ['kassa'],
  Katarina: ['kata'],
  Malphite: ['malph', 'caillou'],
  Malzahar: ['malz'],
  Nautilus: ['naut', 'nau'],
  Nocturne: ['noc'],
  Orianna: ['ori'],
  Pantheon: ['panth'],
  Sejuani: ['seju'],
  Seraphine: ['sera'],
  Tristana: ['trist'],
  Tryndamere: ['trynda', 'trynd'],
  Vladimir: ['vlad'],
  Volibear: ['voli'],
};

// Normalisation des chaînes pour matcher sans accent ni ponctuation (ex: Kai'Sa -> kaisa)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Fonction de filtrage et de scoring rapide des champions
function searchChampions(
  champions: LoLChampion[],
  query: string,
  excludedIds: Set<string>,
  currentChampId?: string,
  limit: number = 6
): LoLChampion[] {
  const cleanQuery = normalizeString(query.trim());
  if (!cleanQuery) return [];

  const matches: { champ: LoLChampion; score: number }[] = [];

  for (const champ of champions) {
    // Si déjà pris ou banni (hors champion courant du slot), exclure
    if (excludedIds.has(champ.id) && champ.id !== currentChampId) {
      continue;
    }

    const normName = normalizeString(champ.name);
    const normId = normalizeString(champ.id);
    const aliases = (CHAMPION_ALIASES[champ.id] || []).map(normalizeString);

    let score = -1;

    // 1. Alias exact (ex: "asol", "mf", "tf", "gp")
    if (aliases.some(a => a === cleanQuery)) {
      score = 0;
    }
    // 2. Nom commence exactement par la recherche
    else if (normName.startsWith(cleanQuery)) {
      score = 1;
    }
    // 3. Un alias commence par la recherche
    else if (aliases.some(a => a.startsWith(cleanQuery))) {
      score = 2;
    }
    // 4. Le nom contient la recherche
    else if (normName.includes(cleanQuery)) {
      score = 3;
    }
    // 5. L'ID interne commence par la recherche
    else if (normId.startsWith(cleanQuery)) {
      score = 4;
    }
    // 6. L'ID interne contient la recherche
    else if (normId.includes(cleanQuery)) {
      score = 5;
    }

    if (score !== -1) {
      matches.push({ champ, score });
    }
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.champ.name.localeCompare(b.champ.name);
  });

  return matches.slice(0, limit).map(m => m.champ);
}

interface PickSlotItemProps {
  team: 'allies' | 'enemies';
  role: LoLRole;
  label: string;
  icon: string;
  champ: LoLChampion | null;
  isPlayer: boolean;
  isActive: boolean;
  allChampions: LoLChampion[];
  unavailableChampionIds: Set<string>;
  onSelectSlot: () => void;
  onClearSlot: (e: React.MouseEvent) => void;
  onLockIn: (champion: LoLChampion) => void;
}

const PickSlotItem: React.FC<PickSlotItemProps> = ({
  team,
  role,
  label,
  icon,
  champ,
  isPlayer,
  isActive,
  allChampions,
  unavailableChampionIds,
  onSelectSlot,
  onClearSlot,
  onLockIn,
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Suggestions filtrées en direct
  const suggestions = useMemo(() => {
    if (!isActive || !query.trim()) return [];
    return searchChampions(allChampions, query, unavailableChampionIds, champ?.id, 6);
  }, [isActive, query, allChampions, unavailableChampionIds, champ?.id]);

  // Focus automatique du champ texte dès activation
  useEffect(() => {
    if (isActive) {
      setQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isActive]);

  // Réinitialiser la surbrillance si la liste change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions]);

  // Gestion clavier : flèches, entrée pour verrouiller, échap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        const selected = suggestions[highlightedIndex] || suggestions[0];
        onLockIn(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const isAlly = team === 'allies';
  const themeBorderColor = isAlly ? '#0AC8B9' : '#E84057';

  return (
    <div
      ref={containerRef}
      onClick={() => {
        if (!isActive) {
          soundEffects.playSelect();
          onSelectSlot();
        }
      }}
      className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
        isActive
          ? isAlly
            ? 'bg-[#0AC8B9]/15 border-[#0AC8B9] shadow-[0_0_15px_rgba(10,200,185,0.35)] ring-1 ring-[#0AC8B9]'
            : 'bg-[#E84057]/15 border-[#E84057] shadow-[0_0_15px_rgba(232,64,87,0.35)] ring-1 ring-[#E84057]'
          : isPlayer
          ? 'bg-[#112038] border-[#C8AA6E]/60 hover:border-[#C8AA6E]'
          : isAlly
          ? 'bg-[#0D1626] border-slate-800 hover:border-slate-700'
          : 'bg-[#150D15] border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
        {/* Champion Avatar ou Icône de rôle */}
        <div className="relative w-11 h-11 rounded-md overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
          {champ ? (
            <LoLImage 
              src={champ.iconUrl} 
              alt={champ.name} 
              fallbackIcon="champion"
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base opacity-40">
              {icon}
            </div>
          )}
          {isPlayer && (
            <span className="absolute bottom-0 right-0 bg-[#C8AA6E] text-slate-950 font-bold text-[9px] px-1 rounded-tl">
              VOUS
            </span>
          )}
        </div>

        {/* Zone de contenu / Champ de saisie instantanée */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wide">{label}</span>
            {isPlayer && (
              <span className="text-[10px] text-[#C8AA6E] font-medium flex items-center gap-0.5">
                · Votre Champion
              </span>
            )}
          </div>

          {isActive ? (
            /* Mode Saisie Rapide Actif */
            <div className="relative flex items-center w-full" onClick={(e) => e.stopPropagation()}>
              <Search className={`w-3.5 h-3.5 absolute left-2 ${isAlly ? 'text-[#0AC8B9]' : 'text-[#E84057]'}`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={champ ? `Changer (${champ.name})...` : "Taper le nom (ex: Aatrox, Lee)..."}
                className={`w-full bg-[#050C17] text-white text-xs pl-7 pr-7 py-1.5 rounded border ${
                  isAlly ? 'border-[#0AC8B9]/60 focus:border-[#0AC8B9]' : 'border-[#E84057]/60 focus:border-[#E84057]'
                } focus:outline-none focus:ring-1 ${
                  isAlly ? 'focus:ring-[#0AC8B9]' : 'focus:ring-[#E84057]'
                } placeholder-slate-500 font-medium`}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* Mode Affichage Normal */
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold truncate ${champ ? 'text-[#F0E6D2]' : 'text-slate-400 italic font-normal'}`}>
                {champ ? champ.name : 'Taper pour sélectionner...'}
              </span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 flex items-center gap-0.5 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                <Edit3 className="w-2.5 h-2.5" /> Taper
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-2 shrink-0">
        {champ && (
          <button
            type="button"
            onClick={(e) => onClearSlot(e)}
            className="p-1 rounded text-slate-500 hover:text-[#E84057] transition-colors"
            title="Retirer ce champion"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <span className={`w-2 h-2 rounded-full ${champ ? (isAlly ? 'bg-[#0AC8B9]' : 'bg-[#E84057]') : 'bg-slate-700'}`} />
      </div>

      {/* Menu déroulant Popover d'autocomplétion instantanée */}
      {isActive && query.trim().length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#091428] border border-[#785A28]/80 rounded-lg shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-1"
        >
          {suggestions.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
                <span>RÉSULTATS DE RECHERCHE</span>
                <span className="text-[#C8AA6E] flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Entrée pour valider
                </span>
              </div>
              {suggestions.map((c, idx) => {
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => onLockIn(c)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors ${
                      isHighlighted
                        ? isAlly
                          ? 'bg-[#0AC8B9]/25 text-white border border-[#0AC8B9]/50 shadow-sm'
                          : 'bg-[#E84057]/25 text-white border border-[#E84057]/50 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <LoLImage src={c.iconUrl} alt={c.name} fallbackIcon="champion" className="w-full h-full object-cover" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate text-[#F0E6D2]">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {c.roles.join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[#C8AA6E] shrink-0 ml-2">
                      {isHighlighted ? 'Sélectionner ↵' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              Aucun champion trouvé pour <span className="text-white font-semibold font-mono">"{query}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export interface DraftArenaProps {
  draft: DraftState;
  activeSlot: ActiveSlotType | null;
  compAnalysis: CompAnalysis;
  allChampions?: LoLChampion[];
  pickedChampionIds?: Set<string>;
  bannedChampionIds?: Set<string>;
  onSelectPickSlot: (team: 'allies' | 'enemies', role: LoLRole) => void;
  onClearPickSlot: (team: 'allies' | 'enemies', role: LoLRole, e: React.MouseEvent) => void;
  onSelectBanSlot: (team: 'blue' | 'red', index: number) => void;
  onClearBanSlot: (team: 'blue' | 'red', index: number, e: React.MouseEvent) => void;
  onAssignChampion?: (champion: LoLChampion, targetSlot?: ActiveSlotType) => void;
  onResetDraft: () => void;
  onChangePlayerRole: (role: LoLRole) => void;
  onOpenDraftSuggestions: () => void;
  onGenerateBuilds: () => void;
  onOpenLcuModal: () => void;
}

export const DraftArena: React.FC<DraftArenaProps> = ({
  draft,
  activeSlot,
  compAnalysis,
  allChampions = [],
  pickedChampionIds = new Set(),
  bannedChampionIds = new Set(),
  onSelectPickSlot,
  onClearPickSlot,
  onSelectBanSlot,
  onClearBanSlot,
  onAssignChampion,
  onResetDraft,
  onChangePlayerRole,
  onOpenDraftSuggestions,
  onGenerateBuilds,
  onOpenLcuModal,
}) => {
  // Ensemble combiné des champions indisponibles (déjà pris ou bannis)
  const unavailableChampionIds = useMemo(() => {
    const combined = new Set<string>();
    pickedChampionIds.forEach(id => combined.add(id));
    bannedChampionIds.forEach(id => combined.add(id));
    return combined;
  }, [pickedChampionIds, bannedChampionIds]);

  // État local pour la barre de recherche rapide de BAN
  const [banSearchQuery, setBanSearchQuery] = useState('');
  const [banHighlightedIndex, setBanHighlightedIndex] = useState(0);
  const banInputRef = useRef<HTMLInputElement>(null);

  // Vérifier si un slot de ban est actuellement sélectionné
  const isBanActive = activeSlot?.type === 'ban';
  const activeBanTeam = isBanActive ? activeSlot.team : null;
  const activeBanIndex = isBanActive ? activeSlot.index : null;

  // Suggestions filtrées pour la saisie de ban
  const banSuggestions = useMemo(() => {
    if (!isBanActive || !banSearchQuery.trim()) return [];
    return searchChampions(allChampions, banSearchQuery, unavailableChampionIds, undefined, 6);
  }, [isBanActive, banSearchQuery, allChampions, unavailableChampionIds]);

  useEffect(() => {
    if (isBanActive) {
      setBanSearchQuery('');
      setBanHighlightedIndex(0);
      setTimeout(() => {
        banInputRef.current?.focus();
      }, 50);
    }
  }, [isBanActive, activeBanTeam, activeBanIndex]);

  useEffect(() => {
    setBanHighlightedIndex(0);
  }, [banSuggestions]);

  // Passage automatique au slot suivant après verrouillage
  const advanceToNextSlot = (currentTeam: 'allies' | 'enemies', currentRole: LoLRole) => {
    const rolesOrder: LoLRole[] = ['TOP', 'JUNGLE', 'MID', 'BOTTOM', 'SUPPORT'];
    const currentIndex = rolesOrder.indexOf(currentRole);
    
    // Trouver le prochain slot vide dans la même équipe
    for (let i = 1; i <= rolesOrder.length; i++) {
      const nextRole = rolesOrder[(currentIndex + i) % rolesOrder.length];
      if (!draft[currentTeam][nextRole]) {
        onSelectPickSlot(currentTeam, nextRole);
        return;
      }
    }
  };

  const advanceToNextBanSlot = (currentTeam: 'blue' | 'red', currentIndex: number) => {
    // Prochain slot de ban vide dans la même équipe ou l'équipe opposée
    const bans = draft.bans[currentTeam];
    for (let i = 1; i < 5; i++) {
      const nextIdx = (currentIndex + i) % 5;
      if (!bans[nextIdx]) {
        onSelectBanSlot(currentTeam, nextIdx);
        return;
      }
    }
    // Si la même équipe est pleine, passer à l'autre
    const otherTeam: 'blue' | 'red' = currentTeam === 'blue' ? 'red' : 'blue';
    const otherBans = draft.bans[otherTeam];
    for (let i = 0; i < 5; i++) {
      if (!otherBans[i]) {
        onSelectBanSlot(otherTeam, i);
        return;
      }
    }
  };

  const handlePickLockIn = (team: 'allies' | 'enemies', role: LoLRole, champ: LoLChampion) => {
    if (onAssignChampion) {
      onAssignChampion(champ, { type: 'pick', team, role });
    }
    advanceToNextSlot(team, role);
  };

  const handleBanLockIn = (champ: LoLChampion) => {
    if (isBanActive && onAssignChampion) {
      onAssignChampion(champ, { type: 'ban', team: activeSlot.team, index: activeSlot.index });
      advanceToNextBanSlot(activeSlot.team, activeSlot.index);
    }
  };

  const handleBanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (banSuggestions.length > 0) {
        setBanHighlightedIndex(prev => (prev + 1) % banSuggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (banSuggestions.length > 0) {
        setBanHighlightedIndex(prev => (prev - 1 + banSuggestions.length) % banSuggestions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (banSuggestions.length > 0) {
        handleBanLockIn(banSuggestions[banHighlightedIndex] || banSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setBanSearchQuery('');
      banInputRef.current?.blur();
    }
  };

  return (
    <div className="bg-[#091428]/80 border border-[#785A28]/30 rounded-xl p-4 sm:p-6 shadow-2xl relative backdrop-blur-sm">
      
      {/* Background Hextech Runes Decor */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0AC8B9]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#E84057]/5 blur-3xl pointer-events-none" />

      {/* Top Banner / Role & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#C8AA6E] font-mono">
              Simulateur Champion Select 5v5
            </span>
            <span className="text-[10px] bg-[#0AC8B9]/20 text-[#0AC8B9] px-2 py-0.5 rounded font-mono border border-[#0AC8B9]/30">
              ⚡ Saisie Directe Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#F0E6D2] font-hextech">
            Tableau de Draft & Phase de Bans
          </h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-medium">Votre rôle :</label>
            <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-slate-800">
              {ROLES.map(({ key, label }) => {
                const isSelected = draft.playerRole === key;
                return (
                  <button
                    key={key}
                    onClick={() => { soundEffects.playSelect(); onChangePlayerRole(key); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bouton Synchro Client LoL (LCU) */}
          <button
            onClick={() => { soundEffects.playSelect(); onOpenLcuModal(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0AC8B9] hover:text-white bg-[#0AC8B9]/15 hover:bg-[#0AC8B9]/25 border border-[#0AC8B9]/40 rounded-lg transition-all shadow-sm shrink-0"
            title="Connecter et pré-remplir la draft en automatique depuis le client League of Legends"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0AC8B9]" />
            <span>Sync Client LoL (LCU)</span>
          </button>

          {/* Bouton pour Réinitialiser / Clean la Champ Select */}
          <button
            onClick={() => { soundEffects.playSelect(); onResetDraft(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 bg-[#111827] hover:bg-red-950/30 border border-slate-700 hover:border-red-500/50 rounded-lg transition-colors shrink-0"
            title="Effacer tous les champions sélectionnés et bannis"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Vider la Draft</span>
          </button>
        </div>
      </div>

      {/* Guide Astuce Rapide */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-[#050C17] border border-[#785A28]/30 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[#C8AA6E] font-bold">⚡ Sélection ultra-rapide :</span>
          <span>Cliquez sur n'importe quel slot ou tapez directement le nom d'un champion (ex: <i>Aatrox</i>, <i>Lee</i>, <i>Ahri</i>), puis appuyez sur <b>Entrée ↵</b> pour verrouiller !</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          ↑↓ naviguer · ↵ verrouiller
        </span>
      </div>

      {/* 5v5 Matchup Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        
        {/* Blue Team (Allies) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-2 text-xs font-semibold">
            <span className="text-[#0AC8B9] flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Shield className="w-3.5 h-3.5" /> Équipe Bleue (Alliés)
            </span>
            <span className="text-slate-400 text-[11px]">Tapez ou cliquez pour assigner</span>
          </div>

          <div className="space-y-2">
            {ROLES.map(({ key, label, icon }) => {
              const champ = draft.allies[key];
              const isPlayer = draft.playerRole === key;
              const isActive = activeSlot?.type === 'pick' && activeSlot?.team === 'allies' && activeSlot?.role === key;

              return (
                <PickSlotItem
                  key={`ally-${key}`}
                  team="allies"
                  role={key}
                  label={label}
                  icon={icon}
                  champ={champ}
                  isPlayer={isPlayer}
                  isActive={isActive}
                  allChampions={allChampions}
                  unavailableChampionIds={unavailableChampionIds}
                  onSelectSlot={() => onSelectPickSlot('allies', key)}
                  onClearSlot={(e) => onClearPickSlot('allies', key, e)}
                  onLockIn={(selectedChamp) => handlePickLockIn('allies', key, selectedChamp)}
                />
              );
            })}
          </div>
        </div>

        {/* Center VS */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center py-2 text-center">
          <div className="w-9 h-9 rounded-full bg-[#111827] border border-[#785A28] flex items-center justify-center text-xs font-bold text-[#C8AA6E] font-hextech shadow-inner my-2">
            VS
          </div>
        </div>

        {/* Red Team (Enemies) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-2 text-xs font-semibold">
            <span className="text-[#E84057] flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Swords className="w-3.5 h-3.5" /> Équipe Rouge (Ennemis)
            </span>
            <span className="text-slate-400 text-[11px]">Tapez ou cliquez pour assigner</span>
          </div>

          <div className="space-y-2">
            {ROLES.map(({ key, label, icon }) => {
              const champ = draft.enemies[key];
              const isActive = activeSlot?.type === 'pick' && activeSlot?.team === 'enemies' && activeSlot?.role === key;

              return (
                <PickSlotItem
                  key={`enemy-${key}`}
                  team="enemies"
                  role={key}
                  label={label}
                  icon={icon}
                  champ={champ}
                  isPlayer={false}
                  isActive={isActive}
                  allChampions={allChampions}
                  unavailableChampionIds={unavailableChampionIds}
                  onSelectSlot={() => onSelectPickSlot('enemies', key)}
                  onClearSlot={(e) => onClearPickSlot('enemies', key, e)}
                  onLockIn={(selectedChamp) => handlePickLockIn('enemies', key, selectedChamp)}
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* PHASE DE BANS (10 SLOTS DE BANS OFFICIELS AVEC SAISIE RAPIDE DIRECTE) */}
      <div className="mt-6 p-4 rounded-lg bg-[#050B14] border border-red-950/60 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold uppercase tracking-wider">
            <Ban className="w-4 h-4 text-red-500" />
            <span>Phase de Bans (Champions Interdits & Bloqués)</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Cliquez sur un slot de ban ou tapez le nom ci-dessous
          </span>
        </div>

        {/* Barre de saisie rapide de ban si un slot de ban est sélectionné */}
        {isBanActive && (
          <div className="mb-3 p-2.5 rounded-lg bg-[#0F192C] border border-red-500/60 shadow-lg animate-in fade-in slide-in-from-top-1 relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200 shrink-0">
                <span className={activeBanTeam === 'blue' ? 'text-[#0AC8B9]' : 'text-[#E84057]'}>
                  Bannir pour l'Équipe {activeBanTeam === 'blue' ? 'Bleue' : 'Rouge'} #{activeBanIndex! + 1} :
                </span>
              </div>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-red-400" />
                <input
                  ref={banInputRef}
                  type="text"
                  value={banSearchQuery}
                  onChange={(e) => setBanSearchQuery(e.target.value)}
                  onKeyDown={handleBanKeyDown}
                  placeholder="Taper le champion à bannir (ex: Zed, Yasuo, Shaco)... Entrée pour verrouiller"
                  className="w-full bg-[#050B14] text-white text-xs pl-8 pr-8 py-1.5 rounded border border-red-500/50 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-500"
                />
                {banSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBanSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions d'autocomplétion pour les bans */}
            {banSuggestions.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#091428] border border-red-500/60 rounded-lg shadow-2xl p-1.5 backdrop-blur-xl">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
                  <span>CHAMPIONS À BANNIR</span>
                  <span className="text-red-400 flex items-center gap-1 font-mono">
                    <CornerDownLeft className="w-3 h-3" /> Entrée pour bannir
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-1">
                  {banSuggestions.map((c, idx) => {
                    const isHighlighted = idx === banHighlightedIndex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onMouseEnter={() => setBanHighlightedIndex(idx)}
                        onClick={() => handleBanLockIn(c)}
                        className={`flex items-center gap-2 p-1.5 rounded text-left transition-colors ${
                          isHighlighted
                            ? 'bg-red-950/60 text-white border border-red-500 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className="w-7 h-7 rounded overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                          <LoLImage src={c.iconUrl} alt={c.name} fallbackIcon="champion" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-red-200 truncate">{c.name}</div>
                          <div className="text-[9px] text-slate-400 truncate">{c.roles[0] || 'Champ'}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Blue Bans (5 slots) */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#091428] border border-slate-800">
            <span className="text-[11px] font-mono text-[#0AC8B9] font-bold w-16 shrink-0">Bans Bleus :</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {(draft.bans.blue || [null, null, null, null, null]).map((champ, idx) => {
                const isActive = activeSlot?.type === 'ban' && activeSlot?.team === 'blue' && activeSlot?.index === idx;

                return (
                  <div
                    key={`ban-blue-${idx}`}
                    onClick={() => { soundEffects.playSelect(); onSelectBanSlot('blue', idx); }}
                    className={`relative w-10 h-10 rounded border cursor-pointer transition-all shrink-0 flex items-center justify-center overflow-hidden ${
                      isActive
                        ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'border-slate-800 bg-[#0D1626] hover:border-slate-700'
                    }`}
                    title={champ ? `Banni : ${champ.name}` : `Bannir champion #${idx + 1}`}
                  >
                    {champ ? (
                      <>
                        <LoLImage src={champ.iconUrl} alt={champ.name} fallbackIcon="champion" className="w-full h-full object-cover grayscale opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Ban className="w-5 h-5 text-red-500 stroke-[3]" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => onClearBanSlot('blue', idx, e)}
                          className="absolute top-0 right-0 bg-black/80 text-slate-400 hover:text-red-400 p-0.5 rounded-bl z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Red Bans (5 slots) */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#091428] border border-slate-800">
            <span className="text-[11px] font-mono text-[#E84057] font-bold w-16 shrink-0">Bans Rouges :</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {(draft.bans.red || [null, null, null, null, null]).map((champ, idx) => {
                const isActive = activeSlot?.type === 'ban' && activeSlot?.team === 'red' && activeSlot?.index === idx;

                return (
                  <div
                    key={`ban-red-${idx}`}
                    onClick={() => { soundEffects.playSelect(); onSelectBanSlot('red', idx); }}
                    className={`relative w-10 h-10 rounded border cursor-pointer transition-all shrink-0 flex items-center justify-center overflow-hidden ${
                      isActive
                        ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'border-slate-800 bg-[#0D1626] hover:border-slate-700'
                    }`}
                    title={champ ? `Banni : ${champ.name}` : `Bannir champion #${idx + 1}`}
                  >
                    {champ ? (
                      <>
                        <LoLImage src={champ.iconUrl} alt={champ.name} fallbackIcon="champion" className="w-full h-full object-cover grayscale opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Ban className="w-5 h-5 text-red-500 stroke-[3]" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => onClearBanSlot('red', idx, e)}
                          className="absolute top-0 right-0 bg-black/80 text-slate-400 hover:text-red-400 p-0.5 rounded-bl z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Strategic Live Comp Breakdown */}
      <div className="mt-4 p-4 rounded-lg bg-[#050B14] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="text-[#C8AA6E] font-mono uppercase tracking-wider">Analyse Dégâts Ennemis :</span>
            <span className="text-amber-400 font-mono tabular-nums">{compAnalysis.enemyDamageSplit.adPercentage}% AD</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-400 font-mono tabular-nums">{compAnalysis.enemyDamageSplit.apPercentage}% AP</span>
            {compAnalysis.enemyThreats.heavyCc && (
              <span className="text-red-400 text-[11px] font-mono ml-2">⚠️ Gros Contrôles (Heavy CC)</span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {compAnalysis.suggestedFocus}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => { soundEffects.playSelect(); onOpenDraftSuggestions(); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#162238] hover:bg-[#1f3152] border border-[#0AC8B9]/40 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#0AC8B9]" />
            Suggestions IA de Draft
          </button>

          <button
            onClick={() => { soundEffects.playLockIn(); onGenerateBuilds(); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] via-[#F0E6D2] to-[#C8AA6E] hover:brightness-110 rounded-lg shadow-lg transition-all transform active:scale-95 whitespace-nowrap"
          >
            <Wand2 className="w-4 h-4 text-[#091428]" />
            Générer les 5 Builds
          </button>
        </div>

      </div>

    </div>
  );
};
