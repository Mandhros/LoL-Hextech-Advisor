/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Key, Volume2, VolumeX } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeaderProps {
  patchVersion: string;
  activeView: 'draft' | 'builds' | 'stats';
  onNavigate: (view: 'draft' | 'builds' | 'stats') => void;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  patchVersion,
  activeView,
  onNavigate,
  onOpenApiKeyModal,
}) => {
  const [soundOn, setSoundOn] = React.useState(soundEffects.isSoundEnabled());

  const handleToggleSound = () => {
    const newState = soundEffects.toggleSound();
    setSoundOn(newState);
    if (newState) soundEffects.playSelect();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#091428]/95 backdrop-blur-md border-b border-[#785A28]/40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onNavigate('draft')} 
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#C8AA6E] via-[#785A28] to-[#0AC8B9] p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-[#091428] rounded-[5px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#C8AA6E] group-hover:text-[#0AC8B9] transition-colors" />
              </div>
            </div>
            <div className="leading-tight">
              <span className="text-base sm:text-lg font-bold tracking-wider text-[#F0E6D2] font-hextech whitespace-nowrap">
                HEXTECH ADVISOR
              </span>
              <span className="block text-[10px] text-[#0AC8B9] font-mono tracking-widest uppercase">
                Patch {patchVersion} · LoL Draft & Builds
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 3 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => { soundEffects.playSelect(); onNavigate('draft'); }}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeView === 'draft'
                ? 'text-[#F0E6D2] border-[#0AC8B9] font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            Simulateur de Draft
          </button>
          
          <button
            onClick={() => { soundEffects.playSelect(); onNavigate('builds'); }}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeView === 'builds'
                ? 'text-[#F0E6D2] border-[#C8AA6E] font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            Générateur 5 Builds
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); onNavigate('stats'); }}
            className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
              activeView === 'stats'
                ? 'text-[#F0E6D2] border-[#0AC8B9] font-semibold'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            Base de Données & Stats
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + sound control */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Couper le son' : 'Activer le son'}
            className="p-2 text-slate-400 hover:text-[#C8AA6E] rounded-md hover:bg-[#1E2836] transition-colors"
            title={soundOn ? 'Effets sonores activés' : 'Effets sonores désactivés'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); onOpenApiKeyModal(); }}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] hover:brightness-110 rounded-md transition-all shadow-md whitespace-nowrap shrink-0 border border-[#C8AA6E]/60"
          >
            <Key className="w-3.5 h-3.5 text-[#091428]" />
            <span>Clé Gemini & API</span>
          </button>
        </div>

      </div>
    </header>
  );
};
