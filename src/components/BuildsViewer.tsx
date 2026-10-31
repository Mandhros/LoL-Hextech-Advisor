/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LoLBuild, LoLChampion, LoLItem, LoLRole } from '../types/lol';
import { Sparkles, Trophy, Shield, Swords, Zap, Copy, Check, Download, RefreshCw, Layers } from 'lucide-react';
import { RUNE_TREES_META } from '../data/starterRunes';
import { LoLImage } from './LoLImage';
import { soundEffects } from '../utils/audio';

const ROLES: { key: LoLRole; label: string; icon: string }[] = [
  { key: 'TOP', label: 'Toplane', icon: '🛡️' },
  { key: 'JUNGLE', label: 'Jungle', icon: '🌲' },
  { key: 'MID', label: 'Midlane', icon: '⚡' },
  { key: 'BOTTOM', label: 'Bot / ADC', icon: '🏹' },
  { key: 'SUPPORT', label: 'Support', icon: '🤝' },
];

interface BuildsViewerProps {
  champion: LoLChampion;
  currentRole: LoLRole;
  onSelectRole: (role: LoLRole) => void;
  builds: LoLBuild[];
  isGeneratingAi: boolean;
  onRegenerateAiBuilds: () => void;
}

export const BuildsViewer: React.FC<BuildsViewerProps> = ({
  champion,
  currentRole,
  onSelectRole,
  builds,
  isGeneratingAi,
  onRegenerateAiBuilds,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeItemTooltip, setActiveItemTooltip] = useState<LoLItem | null>(null);

  const currentBuild = builds[activeTab] || builds[0];

  const getTabIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-4 h-4 text-[#C8AA6E]" />;
      case 1: return <Shield className="w-4 h-4 text-[#0AC8B9]" />;
      case 2: return <Swords className="w-4 h-4 text-[#E84057]" />;
      case 3: return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 4: return <Zap className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  // Les 6 objets complets du Full Build
  const fullBuildItems: { slotNumber: number; label: string; item: LoLItem; isBoots?: boolean; isCore?: boolean }[] = [
    { slotNumber: 1, label: 'Bottes', item: currentBuild.boots, isBoots: true },
    ...(currentBuild.coreItems || []).slice(0, 3).map((item, idx) => ({
      slotNumber: idx + 2,
      label: `Core #${idx + 1}`,
      item,
      isCore: true,
    })),
    ...(currentBuild.lateItems || []).slice(0, 2).map((item, idx) => ({
      slotNumber: idx + 5,
      label: `Fin de partie #${idx + 1}`,
      item,
    })),
  ].filter(s => !!s.item);

  const totalGold = fullBuildItems.reduce((acc, curr) => acc + (curr.item?.gold || 0), 0);

  const handleCopyBuild = () => {
    soundEffects.playSelect();
    const text = `=== BUILD ${currentBuild.title} (${champion.name}) ===
Type : ${currentBuild.badgeLabel}
Condition de victoire : ${currentBuild.winCondition}
Inventaire 6 Objets complets : ${fullBuildItems.map(s => s.item.name).join(' + ')} (Coût: ${totalGold} PO)
Rune Principale : ${currentBuild.runes.primaryTree} (${currentBuild.runes.primaryKeystone.name})
Rune Secondaire : ${currentBuild.runes.secondaryTree}
Ordre des Sorts : ${currentBuild.skillOrder.slice(0, 6).join(' > ')}...
Astuce : ${currentBuild.geminiTips.combo}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    soundEffects.playSelect();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentBuild, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lol-build-${champion.id}-${currentBuild.type.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const primaryTreeMeta = RUNE_TREES_META[currentBuild.runes.primaryTree] || RUNE_TREES_META.Precision;
  const secondaryTreeMeta = RUNE_TREES_META[currentBuild.runes.secondaryTree] || RUNE_TREES_META.Resolve;

  return (
    <div className="bg-[#091428]/95 border border-[#785A28]/40 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative">
      
      {/* Top Bar : Champion Banner & Build Tabs Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        
        {/* Champion Spotlight Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border-2 border-[#C8AA6E] shrink-0 shadow-md">
            <LoLImage 
              src={champion.iconUrl} 
              alt={champion.name} 
              fallbackIcon="champion"
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F0E6D2] font-hextech tracking-wide">
                {champion.name}
              </h2>
              <span className="text-xs text-slate-400">· {champion.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="text-[#0AC8B9] font-medium">{champion.roles.join(' · ')}</span>
              <span>·</span>
              <span>Rôle(s) : {champion.tags.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Interactive Lane / Role Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-1.5 rounded-xl bg-[#050B14] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono px-2 font-semibold whitespace-nowrap">
            Lane de jeu :
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {ROLES.map(({ key, label, icon }) => {
              const isSelected = currentRole === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    soundEffects.playSelect();
                    onSelectRole(key);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] text-[#091428] font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={`Adapter immédiatement les 5 builds pour la position ${label}`}
                >
                  <span className="text-xs">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button
            onClick={handleCopyBuild}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#111827] hover:bg-[#1E2836] border border-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#111827] hover:bg-[#1E2836] border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); onRegenerateAiBuilds(); }}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#091428] bg-gradient-to-r from-[#0AC8B9] to-[#005A82] hover:brightness-110 text-slate-900 rounded-lg transition-all disabled:opacity-50"
            title="Relancer l'analyse Gemini sur les builds exotiques"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Génération IA...' : 'Régénérer Exotiques'}</span>
          </button>
        </div>

      </div>

      {/* 5 Segmented Build Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-5">
        {builds.map((b, idx) => {
          const isActive = activeTab === idx;
          const isExotic = idx >= 3;

          return (
            <button
              key={b.id || idx}
              onClick={() => { soundEffects.playSelect(); setActiveTab(idx); }}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                isActive
                  ? isExotic
                    ? 'bg-purple-950/40 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-[#112038] border-[#C8AA6E] shadow-[0_0_12px_rgba(200,170,110,0.25)]'
                  : 'bg-[#0D1626] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] text-slate-400">BUILD #{idx + 1}</span>
                {getTabIcon(idx)}
              </div>
              <div className={`text-xs font-bold truncate ${isActive ? 'text-[#F0E6D2]' : 'text-slate-300'}`}>
                {b.badgeLabel}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {b.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Build Showcase */}
      <div className="space-y-6">
        
        {/* Header of Build */}
        <div className="p-4 rounded-lg bg-[#050B14] border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-bold font-mono tracking-wider uppercase rounded bg-[#C8AA6E]/20 text-[#C8AA6E] border border-[#C8AA6E]/30">
              {currentBuild.badgeLabel}
            </span>
            {currentBuild.isAiGenerated && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-purple-300 bg-purple-900/30 rounded border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Propulsé par Gemini 3.8 Flash pour {champion.name}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech mt-2">
            {currentBuild.title}
          </h3>
          <p className="text-xs text-[#0AC8B9] font-medium mt-0.5">
            {currentBuild.tagline}
          </p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {currentBuild.description}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Condition de Victoire : </span>
              <span className="text-slate-200">{currentBuild.winCondition}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Pics de Puissance : </span>
              <span className="text-amber-300 font-mono text-[11px]">{currentBuild.powerSpikes.join(' · ')}</span>
            </div>
          </div>
        </div>

        {/* FULL 6-ITEMS INVENTORY (INVENTAIRE COMPLET FIN DE PARTIE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#C8AA6E] uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C8AA6E]" />
              <span>Inventaire Complet Fin de Partie (Full Build 6 Objets)</span>
            </h4>
            <span className="text-xs font-mono text-amber-400 tabular-nums">
              Coût Total : {totalGold} PO
            </span>
          </div>

          {/* 6 Objets Alignés en Inventaire Officiel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 p-3 bg-[#050B14] border border-[#C8AA6E]/40 rounded-xl">
            {fullBuildItems.map((slot) => (
              <ItemSlot
                key={`slot-${slot.slotNumber}-${slot.item.id}`}
                item={slot.item}
                label={`Slot #${slot.slotNumber} · ${slot.label}`}
                isCore={slot.isCore}
                isBoots={slot.isBoots}
                onHover={setActiveItemTooltip}
              />
            ))}
          </div>

          {/* Starters & Alternatives Situationnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            
            {/* Starter Items */}
            <div className="bg-[#050B14] border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-2">
                Objets de Départ (Starter & Consommables)
              </span>
              <div className="flex items-center gap-3">
                {currentBuild.starterItems.map((item) => (
                  <ItemSlot 
                    key={`starter-${item.id}`} 
                    item={item} 
                    label="Starter"
                    onHover={setActiveItemTooltip}
                  />
                ))}
              </div>
            </div>

            {/* Alternatives Situationnelles */}
            <div className="bg-[#050B14] border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-2">
                Options Situationnelles de Remplacement
              </span>
              <div className="flex items-center gap-3">
                {currentBuild.situationalItems.map((item, idx) => (
                  <ItemSlot 
                    key={`sit-${item.id || idx}`} 
                    item={item} 
                    label={`Alternative #${idx + 1}`} 
                    onHover={setActiveItemTooltip}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Active Item Details Infobox */}
          {activeItemTooltip && (
            <div className="p-3 bg-[#111827] border border-[#0AC8B9]/40 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <LoLImage src={activeItemTooltip.iconUrl} alt={activeItemTooltip.name} fallbackIcon="item" className="w-8 h-8 rounded" />
                <div>
                  <span className="font-bold text-[#F0E6D2]">{activeItemTooltip.name}</span>
                  <span className="text-amber-400 font-mono ml-2 tabular-nums">({activeItemTooltip.gold} PO)</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{activeItemTooltip.description}</p>
                </div>
              </div>
              <button onClick={() => setActiveItemTooltip(null)} className="text-slate-500 hover:text-slate-300">
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Runes & Skill Order Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Runes Breakdown */}
          <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-[#C8AA6E] uppercase tracking-wider font-mono">
              Configuration Complète des Runes
            </h4>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Primary Tree */}
              <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <LoLImage src={primaryTreeMeta.iconUrl} alt={primaryTreeMeta.name} fallbackIcon="rune" className="w-5 h-5" />
                  <span className="text-xs font-bold text-[#F0E6D2] font-hextech">{primaryTreeMeta.name}</span>
                </div>

                {/* Keystone */}
                <div className="flex items-center gap-2.5 p-2 rounded bg-[#112038] border border-[#C8AA6E]/40 mb-2">
                  <LoLImage 
                    src={currentBuild.runes.primaryKeystone.iconUrl} 
                    alt={currentBuild.runes.primaryKeystone.name} 
                    fallbackIcon="rune"
                    fallbackText={currentBuild.runes.primaryKeystone.name}
                    className="w-8 h-8 rounded shrink-0 object-contain" 
                  />
                  <div>
                    <span className="text-xs font-bold text-[#C8AA6E] block">
                      {currentBuild.runes.primaryKeystone.name}
                    </span>
                    <span className="text-[10px] text-slate-300 line-clamp-2">
                      {currentBuild.runes.primaryKeystone.description}
                    </span>
                  </div>
                </div>

                {/* Primary Slots */}
                <div className="space-y-1.5">
                  {currentBuild.runes.primarySlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 py-0.5">
                      <LoLImage 
                        src={slot.iconUrl} 
                        alt={slot.name} 
                        fallbackIcon="rune"
                        fallbackText={slot.name}
                        className="w-4 h-4 rounded-full shrink-0 object-contain" 
                      />
                      <span className="truncate">{slot.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Tree & Shards */}
              <div className="p-3 rounded-lg bg-[#091428] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <LoLImage src={secondaryTreeMeta.iconUrl} alt={secondaryTreeMeta.name} fallbackIcon="rune" className="w-5 h-5" />
                    <span className="text-xs font-bold text-[#F0E6D2] font-hextech">{secondaryTreeMeta.name}</span>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {currentBuild.runes.secondarySlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300 py-0.5">
                        <LoLImage 
                          src={slot.iconUrl} 
                          alt={slot.name} 
                          fallbackIcon="rune"
                          fallbackText={slot.name}
                          className="w-4 h-4 rounded-full shrink-0 object-contain" 
                        />
                        <span className="truncate">{slot.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shards */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                  <div><span className="text-[#C8AA6E]">Attaque :</span> {currentBuild.runes.shards.offense}</div>
                  <div><span className="text-[#0AC8B9]">Flex :</span> {currentBuild.runes.shards.flex}</div>
                  <div><span className="text-emerald-400">Défense :</span> {currentBuild.runes.shards.defense}</div>
                </div>

              </div>

            </div>
          </div>

          {/* Skill Order (Levels 1 to 18) */}
          <div className="bg-[#050B14] border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#C8AA6E] uppercase tracking-wider font-mono">
                Ordre de Max des Sorts (Niveaux 1 à 18)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Priorité : {currentBuild.skillOrder[0]} &gt; {currentBuild.skillOrder[1]} &gt; {currentBuild.skillOrder[2]}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 text-center">
              {currentBuild.skillOrder.map((spellKey, idx) => {
                const level = idx + 1;
                const isUlt = spellKey === 'R';

                return (
                  <div
                    key={level}
                    className={`p-1.5 rounded border flex flex-col items-center justify-center ${
                      isUlt
                        ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 font-bold'
                        : spellKey === 'Q'
                        ? 'bg-blue-950/30 border-blue-600/50 text-blue-300'
                        : spellKey === 'W'
                        ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                        : 'bg-purple-950/30 border-purple-600/50 text-purple-300'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 font-mono">Lv.{level}</span>
                    <span className="text-sm font-bold font-mono">{spellKey}</span>
                  </div>
                );
              })}
            </div>

            {/* Spell Descriptions Quick View */}
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              {champion.spells.filter(s => s.key !== 'P').map(spell => (
                <div key={spell.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-slate-800 text-[10px] font-bold flex items-center justify-center font-mono">
                    {spell.key}
                  </span>
                  <span className="truncate">{spell.name}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Gemini Tactical Advice & Combo Secrets */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-[#111827] via-[#091428] to-[#111827] border border-purple-500/30 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Conseils Stratégiques & Astuce Combo pour {champion.name} (Gemini Coach)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded bg-[#050B14]/70 border border-slate-800">
              <span className="text-amber-400 font-semibold block mb-1">🎯 Mécanique & Combo ({champion.name}) :</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{currentBuild.geminiTips.combo}</p>
            </div>
            
            <div className="p-2.5 rounded bg-[#050B14]/70 border border-slate-800">
              <span className="text-[#0AC8B9] font-semibold block mb-1">🤝 Synergie Déterminante :</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{currentBuild.geminiTips.synergyHook}</p>
            </div>

            <div className="p-2.5 rounded bg-[#050B14]/70 border border-slate-800">
              <span className="text-[#E84057] font-semibold block mb-1">⚠️ Piège à Éviter :</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{currentBuild.geminiTips.warningTrap}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

interface ItemSlotProps {
  item: LoLItem;
  label: string;
  isCore?: boolean;
  isBoots?: boolean;
  onHover: (item: LoLItem) => void;
}

const ItemSlot: React.FC<ItemSlotProps> = ({ item, label, isCore, isBoots, onHover }) => {
  return (
    <button
      onClick={() => onHover(item)}
      className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all text-center w-full ${
        isCore
          ? 'bg-[#112038] border-[#C8AA6E]/80 hover:border-[#C8AA6E] shadow-sm'
          : isBoots
          ? 'bg-[#0F1E2E] border-[#0AC8B9]/60 hover:border-[#0AC8B9]'
          : 'bg-[#0D1626] border-slate-800 hover:border-slate-700'
      }`}
      title={`${item.name} (${item.gold} PO)`}
    >
      <div className="w-12 h-12 rounded overflow-hidden bg-slate-900 border border-slate-700 group-hover:scale-105 transition-transform">
        <LoLImage 
          src={item.iconUrl} 
          alt={item.name} 
          fallbackIcon="item"
          fallbackText={item.name}
          className="w-full h-full object-cover" 
        />
      </div>
      <span className="text-[10px] text-slate-400 font-mono mt-1 block truncate w-full">
        {label}
      </span>
      <span className="text-xs font-bold text-[#F0E6D2] truncate w-full mt-0.5">
        {item.name}
      </span>
      <span className="text-[10px] text-amber-400 font-mono tabular-nums">
        {item.gold} PO
      </span>
    </button>
  );
};
