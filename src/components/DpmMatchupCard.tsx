/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoLChampion, LoLRole } from '../types/lol';
import { getMatchupDpmComparison } from '../data/dpmMetrics';
import { LoLImage } from './LoLImage';
import { Swords, Flame, Coins, ShieldAlert, Trophy, TrendingUp, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface DpmMatchupCardProps {
  playerChampion: LoLChampion | null;
  enemyChampion: LoLChampion | null;
  role: LoLRole;
}

export const DpmMatchupCard: React.FC<DpmMatchupCardProps> = ({
  playerChampion,
  enemyChampion,
  role,
}) => {
  if (!playerChampion || !enemyChampion) {
    return (
      <div className="bg-[#091428]/80 border border-[#785A28]/30 rounded-xl p-5 text-center text-slate-400">
        <Swords className="w-8 h-8 text-[#C8AA6E]/40 mx-auto mb-2" />
        <p className="text-sm">Sélectionnez votre champion et l'adversaire direct sur la lane pour afficher la matrice DPM.</p>
      </div>
    );
  }

  const comparison = getMatchupDpmComparison(playerChampion, enemyChampion, role);
  if (!comparison) return null;

  const {
    playerMetrics,
    enemyMetrics,
    deltaDpm,
    deltaGd15,
    deltaCsd15,
    laneAdvantagePercent,
    laneFavorite,
    tacticalKey,
    dangerWindow,
    winCondition,
  } = comparison;

  return (
    <div className="bg-[#0A1428]/95 border border-[#C8AA6E]/40 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
      
      {/* En-tête : Face-à-face de Lane */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <LoLImage
              src={playerChampion.iconUrl}
              alt={playerChampion.name}
              className="w-12 h-12 rounded-lg border-2 border-[#0AC8B9] object-cover shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-[#091428] text-[#0AC8B9] text-[10px] font-mono px-1 rounded border border-[#0AC8B9]/50 font-bold">
              VOUS
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F0E6D2] font-hextech tracking-wide">
                {playerChampion.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">vs</span>
              <span className="text-base font-bold text-[#E84057] font-hextech tracking-wide">
                {enemyChampion.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Poste : {role}</span>
              <span>·</span>
              <span className={`font-semibold ${
                laneFavorite === 'PLAYER' ? 'text-emerald-400' : laneFavorite === 'ENEMY' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {laneFavorite === 'PLAYER' 
                  ? `Avantage Lane (${laneAdvantagePercent > 0 ? `+${laneAdvantagePercent}%` : `${laneAdvantagePercent}%`})` 
                  : laneFavorite === 'ENEMY' 
                  ? `Défaveur Lane (${laneAdvantagePercent}%)` 
                  : 'Matchup Équilibré (50/50)'}
              </span>
            </p>
          </div>
        </div>

        {/* Badge DPM.LOL Reference */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#0AC8B9]">
            DPM.LOL METRICS
          </span>
          <span className="text-xs font-mono text-slate-300">
            Escarmouche & Dominance
          </span>
        </div>
      </div>

      {/* Grille des 3 métriques comparatives DPM.LOL */}
      <div className="grid grid-cols-3 gap-3">
        {/* 1. DPM Estimé */}
        <div className="bg-[#050C16] border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> DPM Attendu
            </span>
            <span className={`font-mono text-xs font-bold ${deltaDpm >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {deltaDpm >= 0 ? `+${deltaDpm}` : deltaDpm}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-[#F0E6D2]">
              {playerMetrics.expectedDpm}
            </span>
            <span className="text-xs font-mono text-slate-500">
              vs {enemyMetrics.expectedDpm}
            </span>
          </div>
          {/* Barre visuelle DPM */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div 
              className="bg-[#0AC8B9] h-full"
              style={{ width: `${(playerMetrics.expectedDpm / (playerMetrics.expectedDpm + enemyMetrics.expectedDpm)) * 100}%` }}
            />
            <div 
              className="bg-[#E84057] h-full"
              style={{ width: `${(enemyMetrics.expectedDpm / (playerMetrics.expectedDpm + enemyMetrics.expectedDpm)) * 100}%` }}
            />
          </div>
        </div>

        {/* 2. GD@15 (Gold Diff @ 15m) */}
        <div className="bg-[#050C16] border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-400" /> GD@15
            </span>
            <span className={`font-mono text-xs font-bold ${deltaGd15 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {deltaGd15 >= 0 ? `+${deltaGd15}g` : `${deltaGd15}g`}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-lg font-bold font-mono ${playerMetrics.gd15 >= 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
              {playerMetrics.gd15 >= 0 ? `+${playerMetrics.gd15}g` : `${playerMetrics.gd15}g`}
            </span>
            <span className="text-xs font-mono text-slate-500">
              adv: {enemyMetrics.gd15 >= 0 ? `+${enemyMetrics.gd15}g` : `${enemyMetrics.gd15}g`}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">
            {deltaGd15 >= 0 ? 'Avantage économique moyen' : 'Pression d\'or adverse'}
          </p>
        </div>

        {/* 3. CSD@15 (CS Diff @ 15m) */}
        <div className="bg-[#050C16] border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> CSD@15
            </span>
            <span className={`font-mono text-xs font-bold ${deltaCsd15 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {deltaCsd15 >= 0 ? `+${deltaCsd15}` : deltaCsd15}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-[#F0E6D2]">
              {deltaCsd15 >= 0 ? `+${deltaCsd15}` : deltaCsd15} CS
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              à 15m
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate">
            Profil scaling : {playerMetrics.scalingProfile}
          </p>
        </div>
      </div>

      {/* Profil de puissance & Kill Pressure */}
      <div className="bg-[#050C16] border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Kill Pressure Niv 3</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-slate-200">{playerMetrics.killPressureLv3}%</span>
              <span className="text-slate-600 font-mono">/</span>
              <span className="font-mono text-rose-400 text-[11px]">{enemyMetrics.killPressureLv3}% adv</span>
            </div>
          </div>

          <div className="h-7 w-[1px] bg-slate-800" />

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Kill Pressure Niv 6</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono font-bold text-slate-200">{playerMetrics.killPressureLv6}%</span>
              <span className="text-slate-600 font-mono">/</span>
              <span className="font-mono text-rose-400 text-[11px]">{enemyMetrics.killPressureLv6}% adv</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-400 font-mono">Pic clé :</span>
          <span className="px-2 py-0.5 rounded bg-[#C8AA6E]/10 border border-[#C8AA6E]/30 text-[#F0E6D2] font-mono text-xs">
            {playerMetrics.powerSpikes[0] || '1er Objet'}
          </span>
        </div>
      </div>

      {/* Instructions tactiques synthétiques */}
      <div className="space-y-2 pt-1 text-xs">
        <div className="flex items-start gap-2 bg-[#091428] border border-blue-900/30 rounded-lg p-2.5">
          <Trophy className="w-4 h-4 text-[#C8AA6E] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#F0E6D2] block mb-0.5">Clé du Matchup :</span>
            <p className="text-slate-300 leading-relaxed">{tacticalKey}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-[#091428] border border-red-900/30 rounded-lg p-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300 block mb-0.5">Alerte Danger :</span>
            <p className="text-slate-300 leading-relaxed">{dangerWindow}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
