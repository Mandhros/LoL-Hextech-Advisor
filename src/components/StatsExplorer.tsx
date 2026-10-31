/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LoLChampion, LoLItem, LoLRole } from '../types/lol';
import { LoLImage } from './LoLImage';
import { Search, Shield, Swords, Zap, Activity, Heart, Eye, Percent, Sparkles, Filter } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface StatsExplorerProps {
  champions: LoLChampion[];
  items: LoLItem[];
  onSelectChampionForBuild: (champion: LoLChampion) => void;
}

export const StatsExplorer: React.FC<StatsExplorerProps> = ({
  champions,
  items,
  onSelectChampionForBuild,
}) => {
  const [activeTab, setActiveTab] = useState<'champions' | 'items'>('champions');
  
  // Champion Search, Role Filter & Selection
  const [champSearch, setChampSearch] = useState('');
  const [champRoleFilter, setChampRoleFilter] = useState<string>('ALL');
  const [selectedChamp, setSelectedChamp] = useState<LoLChampion>(champions[0] || null);

  // Item Search & Filter
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<'ALL' | 'PERCENT' | 'AD' | 'AP' | 'TANK' | 'SUPPORT'>('ALL');

  // Filtered Champions with Search & Role Filter
  const filteredChampions = useMemo(() => {
    return champions.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(champSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(champSearch.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(champSearch.toLowerCase()));

      let matchesRole = true;
      if (champRoleFilter !== 'ALL') {
        matchesRole = c.roles.includes(champRoleFilter as any);
      }

      return matchesSearch && matchesRole;
    });
  }, [champions, champSearch, champRoleFilter]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(itemSearch.toLowerCase()));

      let matchesCat = true;
      if (itemCategoryFilter === 'PERCENT') {
        matchesCat = item.description.includes('%') || 
          item.tags.some(t => ['CriticalStrike', 'AttackSpeed', 'LifeSteal', 'ArmorPenetration', 'MagicPenetration'].includes(t));
      } else if (itemCategoryFilter === 'AD') {
        matchesCat = item.tags.includes('Damage') || item.description.includes('Dégâts');
      } else if (itemCategoryFilter === 'AP') {
        matchesCat = item.tags.includes('SpellDamage') || item.description.includes('Puissance');
      } else if (itemCategoryFilter === 'TANK') {
        matchesCat = item.tags.includes('Health') || item.tags.includes('Armor') || item.tags.includes('SpellBlock');
      } else if (itemCategoryFilter === 'SUPPORT') {
        matchesCat = item.tags.includes('Support') || item.tags.includes('Heal') || item.description.includes('bouclier');
      }

      return matchesSearch && matchesCat;
    });
  }, [items, itemSearch, itemCategoryFilter]);

  return (
    <div className="bg-[#091428]/95 border border-[#785A28]/40 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-6">
      
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#0AC8B9] font-mono">
            Encyclopédie Officielle Riot Data Dragon
          </span>
          <h2 className="text-xl font-bold text-[#F0E6D2] font-hextech">
            Base de Données des Statistiques & Ratios
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-[#050B14] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { soundEffects.playSelect(); setActiveTab('champions'); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'champions'
                ? 'bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] text-[#091428] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Champions ({champions.length})</span>
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); setActiveTab('items'); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'items'
                ? 'bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Objets & % Stats ({items.length})</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: CHAMPIONS ===================== */}
      {activeTab === 'champions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          
          {/* Champions List & Search with Role Filters */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* Search Input & Role Filters */}
            <div className="space-y-2.5 bg-[#050B14] p-3 rounded-xl border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={champSearch}
                  onChange={(e) => setChampSearch(e.target.value)}
                  placeholder="Rechercher par nom, titre ou tag..."
                  className="w-full pl-9 pr-8 py-2 bg-[#091428] border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0AC8B9]"
                />
                {champSearch && (
                  <button
                    onClick={() => setChampSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Lane / Role Filter Pills */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { key: 'ALL', label: 'Tous' },
                  { key: 'TOP', label: 'Top' },
                  { key: 'JUNGLE', label: 'Jungle' },
                  { key: 'MID', label: 'Mid' },
                  { key: 'BOTTOM', label: 'Bot' },
                  { key: 'SUPPORT', label: 'Supp' },
                ].map(({ key, label }) => {
                  const isActive = champRoleFilter === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        soundEffects.playSelect();
                        setChampRoleFilter(key);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] text-[#091428] font-bold shadow-sm'
                          : 'bg-[#091428] text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
                <span className="text-[10px] text-slate-500 font-mono ml-auto">
                  {filteredChampions.length} champions
                </span>
              </div>
            </div>

            {/* Champions 2-Column Responsive Grid with Large Cards */}
            <div className="grid grid-cols-2 gap-2 max-h-[660px] overflow-y-auto pr-1">
              {filteredChampions.map((champ) => {
                const isSelected = selectedChamp?.id === champ.id;
                return (
                  <button
                    key={champ.id}
                    onClick={() => {
                      soundEffects.playSelect();
                      setSelectedChamp(champ);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 group ${
                      isSelected
                        ? 'bg-[#112038] border-[#C8AA6E] shadow-[0_0_12px_rgba(200,170,110,0.25)] ring-1 ring-[#C8AA6E]'
                        : 'bg-[#0D1626] border-slate-800 hover:border-slate-700 hover:bg-[#111c30]'
                    }`}
                  >
                    <LoLImage
                      src={champ.iconUrl}
                      alt={champ.name}
                      fallbackIcon="champion"
                      className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="truncate min-w-0">
                      <div className={`text-xs font-bold truncate transition-colors ${
                        isSelected ? 'text-[#F0E6D2]' : 'text-slate-200 group-hover:text-[#C8AA6E]'
                      }`}>
                        {champ.name}
                      </div>
                      <div className="text-[10px] text-[#0AC8B9] font-medium truncate mt-0.5">
                        {champ.roles.join(', ')}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono truncate">
                        {champ.tags[0] || 'Combattant'}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredChampions.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-400 space-y-2">
                  <p className="text-xs">Aucun champion ne correspond à vos filtres.</p>
                  <button
                    onClick={() => { setChampSearch(''); setChampRoleFilter('ALL'); }}
                    className="text-xs text-[#0AC8B9] hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Selected Champion Detailed Stats Sheet */}
          {selectedChamp && (
            <div className="lg:col-span-7 bg-[#050B14] border border-slate-800 rounded-xl p-5 space-y-5">
              
              {/* Champion Card Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <LoLImage
                    src={selectedChamp.iconUrl}
                    alt={selectedChamp.name}
                    fallbackIcon="champion"
                    className="w-16 h-16 rounded-xl border-2 border-[#C8AA6E] object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-[#F0E6D2] font-hextech">
                      {selectedChamp.name}
                    </h3>
                    <p className="text-xs text-[#C8AA6E]">{selectedChamp.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="text-[#0AC8B9] font-medium">{selectedChamp.roles.join(', ')}</span>
                      <span>·</span>
                      <span>{selectedChamp.tags.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playLockIn();
                    onSelectChampionForBuild(selectedChamp);
                  }}
                  className="px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] hover:brightness-110 rounded-lg transition-all shadow-md shrink-0 whitespace-nowrap"
                >
                  Générer Builds pour ce Champion
                </button>
              </div>

              {/* Exact Stats Matrix & Level Scaling */}
              <div>
                <h4 className="text-xs font-bold text-[#C8AA6E] font-mono uppercase tracking-wider mb-3">
                  Statistiques de Base & Montée par Niveau
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  
                  {/* PV */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-emerald-400 font-mono uppercase">Points de Vie (PV)</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.hp}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+{selectedChamp.stats.hpperlevel} / niveau</div>
                  </div>

                  {/* AD */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-amber-400 font-mono uppercase">Dégâts d'Attaque (AD)</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.attackdamage}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+{selectedChamp.stats.attackdamageperlevel} / niveau</div>
                  </div>

                  {/* Armure */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-blue-400 font-mono uppercase">Armure Physique</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.armor}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+{selectedChamp.stats.armorperlevel} / niveau</div>
                  </div>

                  {/* RM */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-purple-400 font-mono uppercase">Résistance Magique</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.spellblock}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+1.3 / niveau</div>
                  </div>

                  {/* Vitesse Attaque */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-cyan-400 font-mono uppercase">Vitesse d'Attaque (AS)</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.attackspeed}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+2.5% / niveau</div>
                  </div>

                  {/* Vitesse Déplacement */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Vitesse Déplacement</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.movespeed}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Vitesse de base</div>
                  </div>

                  {/* Mana / Énergie */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-indigo-400 font-mono uppercase">Ressource (Mana/Énergie)</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.stats.mp > 0 ? selectedChamp.stats.mp : 'Sans Mana'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {selectedChamp.stats.mp > 0 ? '+45 / niveau' : 'Énergie / Rage'}
                    </div>
                  </div>

                  {/* Portée */}
                  <div className="p-3 rounded-lg bg-[#091428] border border-slate-800">
                    <div className="text-[10px] text-rose-400 font-mono uppercase">Portée d'Attaque</div>
                    <div className="text-base font-bold text-slate-100 font-mono tabular-nums mt-0.5">
                      {selectedChamp.tags.includes('Marksman') ? '550-650' : '175 (Mêlée)'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Unité de distance</div>
                  </div>

                </div>
              </div>

              {/* Spells & Descriptions avec Détails Techniques */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#C8AA6E] font-mono uppercase tracking-wider">
                    Arsenal de Compétences (Passif & Sorts) - Détails Techniques
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Cooldowns · Coûts · Portées · Ratios</span>
                </div>

                <div className="space-y-3">
                  {selectedChamp.spells.map((spell) => {
                    const isPassive = spell.key === 'P';
                    const keyBadgeColor = isPassive 
                      ? 'bg-purple-900/60 text-purple-300 border-purple-700/50' 
                      : spell.key === 'R' 
                      ? 'bg-amber-900/60 text-amber-300 border-amber-600/60' 
                      : 'bg-[#091428] text-[#0AC8B9] border-cyan-800/60';

                    return (
                      <div key={spell.id} className="p-3.5 rounded-xl bg-[#091428] border border-slate-800/90 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <LoLImage
                              src={spell.iconUrl}
                              alt={spell.name}
                              fallbackIcon="champion"
                              className="w-11 h-11 rounded-lg border border-slate-700 shrink-0 object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${keyBadgeColor}`}>
                                  {isPassive ? 'Passif' : spell.key}
                                </span>
                                <span className="text-sm font-bold text-[#F0E6D2]">{spell.name}</span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {spell.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Technical Specs Badges */}
                        <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                          {/* Cooldown */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#050B14] border border-slate-800/80">
                            <span className="text-amber-400">⏱️ CD :</span>
                            <span className="text-slate-200 truncate">{spell.cooldown || (isPassive ? 'Permanent' : 'Non spécifié')}</span>
                          </div>

                          {/* Coût */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#050B14] border border-slate-800/80">
                            <span className="text-cyan-400">💧 Coût :</span>
                            <span className="text-slate-200 truncate">{spell.cost || (isPassive ? 'Sans coût' : '0 Mana')}</span>
                          </div>

                          {/* Portée */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#050B14] border border-slate-800/80">
                            <span className="text-emerald-400">🎯 Portée :</span>
                            <span className="text-slate-200 truncate">{spell.range || (isPassive ? 'Personnelle' : '550')}</span>
                          </div>

                          {/* Ratios & Scalings */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#050B14] border border-slate-800/80">
                            <span className="text-rose-400">⚡ Ratio :</span>
                            <span className="text-slate-200 truncate">{spell.ratios || (isPassive ? 'Stats de base' : '+70% Adaptatif')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ===================== TAB 2: ITEMS & % ===================== */}
      {activeTab === 'items' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Item Category Filters & Search */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'Tous' },
                { key: 'PERCENT', label: '🎯 Statistiques en Pourcentage (%)' },
                { key: 'AD', label: '⚔️ Dégâts AD' },
                { key: 'AP', label: '🔮 Puissance AP' },
                { key: 'TANK', label: '🛡️ Résistances & PV' },
                { key: 'SUPPORT', label: '🤝 Support & Soins' },
              ].map(({ key, label }) => {
                const isActive = itemCategoryFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => { soundEffects.playSelect(); setItemCategoryFilter(key as any); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-slate-900 font-bold shadow-sm'
                        : 'bg-[#050B14] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Rechercher par nom ou % (ex: 40%, critique)..."
                className="w-full pl-9 pr-3 py-2 bg-[#050B14] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0AC8B9]"
              />
            </div>

          </div>

          {/* Items Grid with Detailed Percentage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[650px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const hasPercent = item.description.includes('%');

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#050B14] border border-slate-800 hover:border-[#C8AA6E]/60 transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <LoLImage
                        src={item.iconUrl}
                        alt={item.name}
                        fallbackIcon="item"
                        className="w-12 h-12 rounded-lg border border-slate-700 object-cover group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-sm font-bold text-[#F0E6D2] group-hover:text-[#C8AA6E] truncate transition-colors">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                          <span className="text-amber-400 font-bold tabular-nums">{item.gold} PO</span>
                          {hasPercent && (
                            <span className="text-cyan-400 text-[10px] font-semibold flex items-center gap-0.5">
                              <Percent className="w-3 h-3" /> Contient %
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  {/* Item Tags */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate max-w-[180px]">{item.tags.join(' · ')}</span>
                    <span className="text-slate-500">ID: {item.id}</span>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400">
                <p className="text-sm">Aucun objet ne correspond à votre filtre.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
