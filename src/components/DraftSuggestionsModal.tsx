/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DraftSuggestion, LoLChampion, CoachDraftDiagnosis, CoachSuggestionType } from '../types/lol';
import { X, Sparkles, Shield, Swords, Zap, Check, Award, AlertTriangle, RefreshCw, Crosshair, Flame, Layers } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DraftSuggestionsModalProps {
  isOpen: boolean;
  role: string;
  suggestions: DraftSuggestion[];
  diagnosis?: CoachDraftDiagnosis | null;
  isLoading: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSelectChampion: (champion: LoLChampion) => void;
}

export const DraftSuggestionsModal: React.FC<DraftSuggestionsModalProps> = ({
  isOpen,
  role,
  suggestions,
  diagnosis,
  isLoading,
  onClose,
  onRefresh,
  onSelectChampion,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | CoachSuggestionType>('ALL');

  const filteredSuggestions = useMemo(() => {
    if (filterType === 'ALL') return suggestions;
    return suggestions.filter(s => s.synergyType === filterType);
  }, [suggestions, filterType]);

  if (!isOpen) return null;

  const counts = {
    ALL: suggestions.length,
    COUNTER: suggestions.filter(s => s.synergyType === 'COUNTER').length,
    SYNERGY: suggestions.filter(s => s.synergyType === 'SYNERGY').length,
    BLIND_SAFE: suggestions.filter(s => s.synergyType === 'BLIND_SAFE').length,
    EXOTIC_CHEESE: suggestions.filter(s => s.synergyType === 'EXOTIC_CHEESE').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#091428] border border-[#785A28] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(10,200,185,0.15)] relative overflow-hidden">
        
        {/* Background Runes Ambient */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#0AC8B9]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E84057]/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#060D1A]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8AA6E]/20 to-[#0AC8B9]/20 border border-[#C8AA6E]/60 flex items-center justify-center shadow-inner">
              <Award className="w-5 h-5 text-[#C8AA6E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech tracking-wide">
                  Coach Virtuel Infaillible · Worlds Edition
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#0AC8B9]/20 text-[#0AC8B9] border border-[#0AC8B9]/30">
                  Rôle : {role}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Analyse algorithmique et IA de haute précision inspirée des champions du monde (T1, Gen.G)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={() => { soundEffects.playSelect(); onRefresh(); }}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                title="Recalculer les suggestions de draft"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0AC8B9]' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}

            <button
              onClick={() => { soundEffects.playSelect(); onClose(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {isLoading ? (
            <div className="py-24 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 border-4 border-[#0AC8B9]/20 border-t-[#0AC8B9] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#C8AA6E] animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-[#F0E6D2] font-hextech tracking-wide">
                  Le Coach des Worlds étudie la Champion Select...
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Calcul des win conditions, simulation des match-ups de lane, détection des hard-counters et analyse des synergies 5v5.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* DIAGNOSTIC TACTIQUE DU COACH DES WORLDS */}
              {diagnosis && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E1A2E] to-[#0A1220] border border-[#785A28]/60 shadow-lg relative overflow-hidden space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#C8AA6E] uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-[#0AC8B9]" /> Briefing Stratégique du Coach
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      {diagnosis.teamfightIdentity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {diagnosis.verdict}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                    <div className="bg-[#050C17]/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Dégâts & Menaces Ennemies</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {diagnosis.damageAssessment}
                      </p>
                    </div>

                    <div className="bg-[#050C17]/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-400 block flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Points de Vigilance de l'Équipe
                      </span>
                      {diagnosis.missingNeeds.length > 0 ? (
                        <ul className="text-slate-300 text-[11px] space-y-0.5 list-disc list-inside">
                          {diagnosis.missingNeeds.map((need, i) => (
                            <li key={i} className="text-amber-200/90">{need}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-emerald-400 text-[11px]">Composition alliée équilibrée et cohérente.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TABS DE FILTRAGE DES PROPOSITIONS DU COACH */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    filterType === 'ALL'
                      ? 'bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Tous ({counts.ALL})
                </button>

                {counts.COUNTER > 0 && (
                  <button
                    onClick={() => setFilterType('COUNTER')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                      filterType === 'COUNTER'
                        ? 'bg-red-500 text-white font-bold shadow-sm'
                        : 'text-red-400 hover:bg-red-950/30'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Contre-Picks ({counts.COUNTER})</span>
                  </button>
                )}

                {counts.SYNERGY > 0 && (
                  <button
                    onClick={() => setFilterType('SYNERGY')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                      filterType === 'SYNERGY'
                        ? 'bg-blue-500 text-white font-bold shadow-sm'
                        : 'text-blue-400 hover:bg-blue-950/30'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Synergies 5v5 ({counts.SYNERGY})</span>
                  </button>
                )}

                {counts.BLIND_SAFE > 0 && (
                  <button
                    onClick={() => setFilterType('BLIND_SAFE')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                      filterType === 'BLIND_SAFE'
                        ? 'bg-[#C8AA6E] text-slate-950 font-bold shadow-sm'
                        : 'text-[#C8AA6E] hover:bg-amber-950/30'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Safe Blind-Picks ({counts.BLIND_SAFE})</span>
                  </button>
                )}

                {counts.EXOTIC_CHEESE > 0 && (
                  <button
                    onClick={() => setFilterType('EXOTIC_CHEESE')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                      filterType === 'EXOTIC_CHEESE'
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'text-purple-400 hover:bg-purple-950/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Pocket Cheese ({counts.EXOTIC_CHEESE})</span>
                  </button>
                )}
              </div>

              {/* LISTE DES CARTES DU COACH */}
              <div className="space-y-4">
                {filteredSuggestions.map((sug, idx) => {
                  const isCounter = sug.synergyType === 'COUNTER';
                  const isSynergy = sug.synergyType === 'SYNERGY';
                  const isBlind = sug.synergyType === 'BLIND_SAFE';
                  const isCheese = sug.synergyType === 'EXOTIC_CHEESE';

                  return (
                    <div
                      key={sug.champion.id || idx}
                      className="p-4 sm:p-5 rounded-xl bg-[#050C17] border border-slate-800 hover:border-[#C8AA6E]/70 transition-all shadow-md group relative overflow-hidden space-y-3.5"
                    >
                      {/* Top Row: Champ Header & Lock-in Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-700 group-hover:border-[#C8AA6E] transition-colors shrink-0 shadow-md">
                            <img 
                              src={sug.champion.iconUrl} 
                              alt={sug.champion.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0 right-0 bg-[#C8AA6E] text-slate-950 font-extrabold text-[9px] px-1 rounded-tl">
                              {sug.tier || 'S'}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-bold text-[#F0E6D2] font-hextech tracking-wide">
                                {sug.champion.name}
                              </span>
                              
                              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                                isCounter
                                  ? 'bg-red-950/40 border-red-500/50 text-red-300'
                                  : isSynergy
                                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
                                  : isBlind
                                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                                  : 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                              }`}>
                                {isCounter ? '🛡️ Contre-Pick Direct' : isSynergy ? '🤝 Synergie Wombo' : isBlind ? '🌟 Safe Blind-Pick' : '⚡ Pocket Cheese'}
                              </span>

                              <span className="text-xs font-mono font-bold text-[#0AC8B9] bg-[#0AC8B9]/10 px-2 py-0.5 rounded border border-[#0AC8B9]/20">
                                Note Coach : {sug.score}/100
                              </span>

                              {sug.dpmMetrics && (
                                <span className="text-[10px] font-mono text-[#F0E6D2] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                                  DPM.lol : {sug.dpmMetrics.expectedDpm} DPM · GD@15: {sug.dpmMetrics.gd15 >= 0 ? `+${sug.dpmMetrics.gd15}g` : `${sug.dpmMetrics.gd15}g`} · Scaling : {sug.dpmMetrics.scalingProfile}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                              {sug.reason}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            soundEffects.playLockIn();
                            onSelectChampion(sug.champion);
                            onClose();
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] via-[#F0E6D2] to-[#C8AA6E] hover:brightness-110 rounded-lg shadow-lg transition-all shrink-0 whitespace-nowrap transform active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-[#091428]" />
                          <span>Verrouiller ce Pick</span>
                        </button>
                      </div>

                      {/* Tactical Grid: Win Condition, Lane Plan, Teamfight Role, Warning */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                        
                        {/* 1. Plan de Lane & Spikes */}
                        <div className="bg-[#081224]/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-mono text-[#0AC8B9] uppercase font-bold flex items-center gap-1">
                            <Crosshair className="w-3 h-3" /> Phase de Lane & Spikes
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {sug.lanePhasePlan || "Prendre le contrôle des premières vagues et punir les placements imprudents."}
                          </p>
                        </div>

                        {/* 2. Rôle en Teamfight */}
                        <div className="bg-[#081224]/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-mono text-[#C8AA6E] uppercase font-bold flex items-center gap-1">
                            <Swords className="w-3 h-3" /> Rôle en Teamfight
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {sug.teamfightRole || "Positionnement arrière rigoureux ou engagement coordonné sur les cibles prioritaires."}
                          </p>
                        </div>

                        {/* 3. Avertissement & Pièges */}
                        <div className="bg-[#081224]/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Piège à Éviter
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {sug.coachWarning || "Attention aux décalages ennemis et ne pas s'avancer sans couverture."}
                          </p>
                        </div>

                      </div>

                      {/* Win Condition & Hook Exotique */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs">
                        {sug.winCondition && (
                          <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span><b>Win Condition :</b> {sug.winCondition}</span>
                          </div>
                        )}

                        {sug.exoticBuildHook && (
                          <div className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span><b>Setup Conseillé :</b> {sug.exoticBuildHook}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#060D1A]/90 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Cliquez sur <b>Verrouiller ce Pick</b> pour assigner le champion et charger automatiquement ses 5 builds stratégiques.
          </span>
          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ml-auto"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
