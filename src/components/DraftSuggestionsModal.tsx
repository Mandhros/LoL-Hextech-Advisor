/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DraftSuggestion, LoLChampion } from '../types/lol';
import { X, Sparkles, Shield, Swords, Zap, Check } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DraftSuggestionsModalProps {
  isOpen: boolean;
  role: string;
  suggestions: DraftSuggestion[];
  isLoading: boolean;
  onClose: () => void;
  onSelectChampion: (champion: LoLChampion) => void;
}

export const DraftSuggestionsModal: React.FC<DraftSuggestionsModalProps> = ({
  isOpen,
  role,
  suggestions,
  isLoading,
  onClose,
  onSelectChampion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#091428] border border-[#785A28] rounded-xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#0AC8B9]/15 border border-[#0AC8B9]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0AC8B9]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech">
                Suggestions Stratégiques de Draft (Rôle {role})
              </h3>
              <p className="text-xs text-slate-400">
                Recommandations basées sur la composition adverse et alliée
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#0AC8B9] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#F0E6D2] font-hextech">Analyse de la Draft par Gemini 3.8 Flash...</p>
            <p className="text-xs text-slate-400">Évaluation des match-ups et détection de picks surprises...</p>
          </div>
        ) : (
          <div className="space-y-3.5 my-5">
            {suggestions.map((sug, idx) => {
              const isCounter = sug.synergyType === 'COUNTER';
              const isSynergy = sug.synergyType === 'SYNERGY';
              const isCheese = sug.synergyType === 'EXOTIC_CHEESE';

              return (
                <div
                  key={sug.champion.id || idx}
                  className="p-4 rounded-lg bg-[#050B14] border border-slate-800 hover:border-[#C8AA6E]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                      <img 
                        src={sug.champion.iconUrl} 
                        alt={sug.champion.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F0E6D2] font-hextech">
                          {sug.champion.name}
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                          isCounter
                            ? 'bg-red-950/40 border-red-500/40 text-red-300'
                            : isSynergy
                            ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        }`}>
                          {isCounter ? '🛡️ Contre-Pick' : isSynergy ? '🤝 Synergie Alliée' : '⚡ Pick Surprise / Cheese'}
                        </span>
                        <span className="text-xs text-[#0AC8B9] font-mono tabular-nums">
                          Score : {sug.score}/100
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sug.reason}
                      </p>

                      {sug.exoticBuildHook && (
                        <div className="text-[11px] text-purple-300 font-medium flex items-center gap-1.5 pt-0.5">
                          <Zap className="w-3.5 h-3.5 text-purple-400" />
                          <span>Build Exotique Associé : {sug.exoticBuildHook}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEffects.playLockIn();
                      onSelectChampion(sug.champion);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] hover:brightness-110 rounded-lg transition-all shrink-0 whitespace-nowrap"
                  >
                    Sélectionner
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
