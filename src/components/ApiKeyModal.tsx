/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Key, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { soundEffects } from '../utils/audio';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(geminiService.getUserCustomApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEffects.playSelect();
    geminiService.setUserCustomApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#091428] border border-[#785A28] rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#C8AA6E]/20 border border-[#C8AA6E]/40 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#C8AA6E]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech">
                Configuration Clé Gemini & Déploiement
              </h3>
              <p className="text-xs text-slate-400">
                Mode hybride : Serveur local ou GitHub Pages autonome
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

        {/* Info */}
        <div className="my-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#050B14] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-[#0AC8B9] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Environnement de Développement Actuel :</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Sur votre serveur de dev local ou Cloud Run, les appels à l'IA Gemini transitent automatiquement et de façon sécurisée par le serveur Express (<code className="text-[#C8AA6E] font-mono">/api/gemini/*</code>) avec votre variable <code className="text-[#C8AA6E] font-mono">GEMINI_API_KEY</code>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block">
              Clé d'API Gemini personnelle (Optionnelle pour GitHub Pages) :
            </label>
            <p className="text-[11px] text-slate-400">
              Si vous hébergez cette application sur GitHub Pages en mode purement statique sans backend, vous pouvez renseigner votre clé Gemini ici. Elle sera conservée uniquement dans le navigateur local (<code className="font-mono text-slate-300">localStorage</code>).
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-[#050B14] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#0AC8B9] font-mono"
            />
          </div>

          <div className="p-3 rounded bg-purple-950/20 border border-purple-500/20 flex items-start gap-2 text-[11px] text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Sans clé renseignée, l'application fonctionne parfaitement grâce à un algorithme de secours calculant les builds et conseils tactiques instantanément.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] hover:brightness-110 rounded-lg transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-800" /> : null}
            <span>{saved ? 'Enregistré !' : 'Enregistrer'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
