/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LoLChampion, LoLRole } from '../types/lol';
import { Search, X, Check, Ban, Lock } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface ChampionGridProps {
  champions: LoLChampion[];
  selectedChampion: LoLChampion | null;
  pickedChampionIds: Set<string>;
  bannedChampionIds: Set<string>;
  onSelectChampion: (champion: LoLChampion) => void;
  activeSlotDescription?: string;
  isBanSlotActive?: boolean;
}

const ROLE_FILTERS: { key: 'ALL' | LoLRole; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'TOP', label: 'Top' },
  { key: 'JUNGLE', label: 'Jungle' },
  { key: 'MID', label: 'Mid' },
  { key: 'BOTTOM', label: 'ADC / Bot' },
  { key: 'SUPPORT', label: 'Support' },
];

export const ChampionGrid: React.FC<ChampionGridProps> = ({
  champions,
  selectedChampion,
  pickedChampionIds,
  bannedChampionIds,
  onSelectChampion,
  activeSlotDescription,
  isBanSlotActive,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | LoLRole>('ALL');

  const filteredChampions = useMemo(() => {
    return champions.filter(champ => {
      const matchesSearch = 
        champ.name.toLowerCase().includes(search.toLowerCase()) ||
        champ.title.toLowerCase().includes(search.toLowerCase()) ||
        champ.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'ALL' || champ.roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [champions, search, roleFilter]);

  return (
    <div className="bg-[#091428]/90 border border-[#785A28]/40 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      
      {/* Header with Slot Indicator & Search Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className={`text-xs uppercase tracking-widest font-mono flex items-center gap-1.5 ${
            isBanSlotActive ? 'text-red-400' : 'text-[#0AC8B9]'
          }`}>
            {isBanSlotActive && <Ban className="w-3.5 h-3.5" />}
            {activeSlotDescription || 'Assignation directe'}
          </span>
          <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech">
            {isBanSlotActive ? 'Choisir un Champion à Bannir' : 'Sélectionner un Champion'} ({filteredChampions.length})
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (ex: Yasuo, Ahri, Jinx)..."
            className="w-full pl-9 pr-8 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0AC8B9] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">
        {ROLE_FILTERS.map(({ key, label }) => {
          const isActive = roleFilter === key;
          return (
            <button
              key={key}
              onClick={() => { soundEffects.playSelect(); setRoleFilter(key); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] text-[#091428] font-bold shadow-sm'
                  : 'bg-[#111827] text-slate-300 hover:text-white hover:bg-[#1E2836]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of Champions */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[460px] overflow-y-auto pr-1 mt-2">
        {filteredChampions.map((champ) => {
          const isSelected = selectedChampion?.id === champ.id;
          const isPicked = pickedChampionIds.has(champ.id);
          const isBanned = bannedChampionIds.has(champ.id);

          // Si on est en train de bannir, on ne peut pas bannir un champion déjà banni ou déjà pick
          // Si on est en train de pick, on ne peut pas pick un champion déjà pick ou banni
          const isDisabled = (!isBanSlotActive && (isPicked || isBanned)) || (isBanSlotActive && (isBanned || isPicked));

          return (
            <button
              key={champ.id}
              disabled={isDisabled && !isSelected}
              onClick={() => {
                soundEffects.playSelect();
                onSelectChampion(champ);
              }}
              className={`group relative flex flex-col items-center text-center p-2 rounded-lg border transition-all duration-150 focus-visible:outline-none ${
                isSelected
                  ? 'bg-[#0AC8B9]/15 border-[#0AC8B9] shadow-[0_0_12px_rgba(10,200,185,0.4)] ring-1 ring-[#0AC8B9]'
                  : isBanned
                  ? 'bg-red-950/20 border-red-900/40 opacity-50 cursor-not-allowed'
                  : isPicked
                  ? 'bg-slate-900/60 border-slate-800 opacity-50 cursor-not-allowed'
                  : isBanSlotActive
                  ? 'bg-[#0D1626] border-slate-800 hover:border-red-500 hover:bg-red-950/30'
                  : 'bg-[#0D1626] border-slate-800 hover:border-[#C8AA6E] hover:bg-[#112038]'
              }`}
            >
              {/* Champion Portrait */}
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-md overflow-hidden bg-slate-900 border border-slate-700 group-hover:border-[#C8AA6E] transition-colors shrink-0">
                <img
                  src={champ.iconUrl}
                  alt={champ.name}
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isDisabled ? 'grayscale' : 'group-hover:scale-105'
                  }`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Overlays for Selected / Banned / Picked */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#0AC8B9]/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-[#F0E6D2] stroke-[3]" />
                  </div>
                )}

                {isBanned && !isSelected && (
                  <div className="absolute inset-0 bg-red-950/70 flex flex-col items-center justify-center text-red-400">
                    <Ban className="w-6 h-6 stroke-[2.5]" />
                    <span className="text-[8px] font-mono font-bold tracking-wider mt-0.5 uppercase">Banni</span>
                  </div>
                )}

                {isPicked && !isSelected && !isBanned && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-slate-400">
                    <Lock className="w-5 h-5" />
                    <span className="text-[8px] font-mono tracking-wider mt-0.5 uppercase">Déjà Pris</span>
                  </div>
                )}
              </div>

              {/* Champion Name & Title */}
              <span className={`mt-1.5 text-xs font-bold truncate w-full transition-colors ${
                isDisabled ? 'text-slate-500' : 'text-[#F0E6D2] group-hover:text-[#C8AA6E]'
              }`}>
                {champ.name}
              </span>
              <span className="text-[10px] text-slate-500 truncate w-full">
                {isBanned ? 'Bloqué' : isPicked ? 'Sélectionné' : champ.roles.join(', ')}
              </span>
            </button>
          );
        })}

        {filteredChampions.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <p className="text-sm">Aucun champion ne correspond à votre recherche "{search}".</p>
            <button
              onClick={() => { setSearch(''); setRoleFilter('ALL'); }}
              className="mt-2 text-xs text-[#0AC8B9] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
