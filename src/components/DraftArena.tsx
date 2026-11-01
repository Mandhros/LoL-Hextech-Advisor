/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoLRole, LoLChampion, DraftState, CompAnalysis } from '../types/lol';
import { Shield, Swords, Wand2, X, Sparkles, Ban, Trash2 } from 'lucide-react';
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

interface DraftArenaProps {
  draft: DraftState;
  activeSlot: ActiveSlotType | null;
  compAnalysis: CompAnalysis;
  onSelectPickSlot: (team: 'allies' | 'enemies', role: LoLRole) => void;
  onClearPickSlot: (team: 'allies' | 'enemies', role: LoLRole, e: React.MouseEvent) => void;
  onSelectBanSlot: (team: 'blue' | 'red', index: number) => void;
  onClearBanSlot: (team: 'blue' | 'red', index: number, e: React.MouseEvent) => void;
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
  onSelectPickSlot,
  onClearPickSlot,
  onSelectBanSlot,
  onClearBanSlot,
  onResetDraft,
  onChangePlayerRole,
  onOpenDraftSuggestions,
  onGenerateBuilds,
  onOpenLcuModal,
}) => {
  return (
    <div className="bg-[#091428]/80 border border-[#785A28]/30 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
      
      {/* Background Hextech Runes Decor */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#0AC8B9]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#E84057]/5 blur-3xl pointer-events-none" />

      {/* Top Banner / Role & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C8AA6E] font-mono">
            Simulateur Champion Select 5v5
          </span>
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

      {/* 5v5 Matchup Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        
        {/* Blue Team (Allies) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-2 text-xs font-semibold">
            <span className="text-[#0AC8B9] flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Shield className="w-3.5 h-3.5" /> Équipe Bleue (Alliés)
            </span>
            <span className="text-slate-400 text-[11px]">Cliquez pour assigner</span>
          </div>

          <div className="space-y-2">
            {ROLES.map(({ key, label, icon }) => {
              const champ = draft.allies[key];
              const isPlayer = draft.playerRole === key;
              const isActive = activeSlot?.type === 'pick' && activeSlot?.team === 'allies' && activeSlot?.role === key;

              return (
                <div
                  key={`ally-${key}`}
                  onClick={() => { soundEffects.playSelect(); onSelectPickSlot('allies', key); }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0AC8B9]/15 border-[#0AC8B9] shadow-[0_0_12px_rgba(10,200,185,0.25)]'
                      : isPlayer
                      ? 'bg-[#112038] border-[#C8AA6E]/60 hover:border-[#C8AA6E]'
                      : 'bg-[#0D1626] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Champion Avatar or Placeholder */}
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

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 font-mono uppercase">{label}</span>
                        {isPlayer && (
                          <span className="text-[10px] text-[#C8AA6E] font-medium flex items-center gap-0.5">
                            · Votre Champion
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-[#F0E6D2]">
                        {champ ? champ.name : <span className="text-slate-500 font-normal italic">Non sélectionné</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {champ && (
                      <button
                        onClick={(e) => onClearPickSlot('allies', key, e)}
                        className="p-1 rounded text-slate-500 hover:text-[#E84057] transition-colors"
                        title="Retirer ce champion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className={`w-2 h-2 rounded-full ${champ ? 'bg-[#0AC8B9]' : 'bg-slate-700'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center VS & Analysis Hub */}
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
            <span className="text-slate-400 text-[11px]">Cliquez pour assigner</span>
          </div>

          <div className="space-y-2">
            {ROLES.map(({ key, label, icon }) => {
              const champ = draft.enemies[key];
              const isActive = activeSlot?.type === 'pick' && activeSlot?.team === 'enemies' && activeSlot?.role === key;

              return (
                <div
                  key={`enemy-${key}`}
                  onClick={() => { soundEffects.playSelect(); onSelectPickSlot('enemies', key); }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E84057]/15 border-[#E84057] shadow-[0_0_12px_rgba(232,64,87,0.25)]'
                      : 'bg-[#150D15] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
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
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 font-mono uppercase">{label}</div>
                      <div className="text-sm font-semibold text-[#F0E6D2]">
                        {champ ? champ.name : <span className="text-slate-500 font-normal italic">Non sélectionné</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {champ && (
                      <button
                        onClick={(e) => onClearPickSlot('enemies', key, e)}
                        className="p-1 rounded text-slate-500 hover:text-[#E84057] transition-colors"
                        title="Retirer ce champion"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <span className={`w-2 h-2 rounded-full ${champ ? 'bg-[#E84057]' : 'bg-slate-700'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* PHASE DE BANS (10 SLOTS DE BANS OFFICIELS) */}
      <div className="mt-6 p-4 rounded-lg bg-[#050B14] border border-red-950/60">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-red-400 font-mono font-bold uppercase tracking-wider">
            <Ban className="w-4 h-4 text-red-500" />
            <span>Phase de Bans (Champions Interdits & Bloqués)</span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Cliquez sur un slot pour bannir depuis la grille
          </span>
        </div>

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
                        ? 'border-red-500 bg-red-950/40 ring-1 ring-red-500'
                        : 'border-slate-800 bg-[#0D1626] hover:border-slate-700'
                    }`}
                    title={champ ? `Banni : ${champ.name}` : `Bannir champion #${idx + 1}`}
                  >
                    {champ ? (
                      <>
                        <LoLImage src={champ.iconUrl} alt={champ.name} fallbackIcon="champion" className="w-full h-full object-cover grayscale opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Ban className="w-5 h-5 text-red-500 stroke-[3]" />
                        </div>
                        <button
                          onClick={(e) => onClearBanSlot('blue', idx, e)}
                          className="absolute top-0 right-0 bg-black/80 text-slate-400 hover:text-red-400 p-0.5 rounded-bl"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <Ban className="w-4 h-4 text-slate-600" />
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
                        ? 'border-red-500 bg-red-950/40 ring-1 ring-red-500'
                        : 'border-slate-800 bg-[#0D1626] hover:border-slate-700'
                    }`}
                    title={champ ? `Banni : ${champ.name}` : `Bannir champion #${idx + 1}`}
                  >
                    {champ ? (
                      <>
                        <LoLImage src={champ.iconUrl} alt={champ.name} fallbackIcon="champion" className="w-full h-full object-cover grayscale opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Ban className="w-5 h-5 text-red-500 stroke-[3]" />
                        </div>
                        <button
                          onClick={(e) => onClearBanSlot('red', idx, e)}
                          className="absolute top-0 right-0 bg-black/80 text-slate-400 hover:text-red-400 p-0.5 rounded-bl"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <Ban className="w-4 h-4 text-slate-600" />
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
