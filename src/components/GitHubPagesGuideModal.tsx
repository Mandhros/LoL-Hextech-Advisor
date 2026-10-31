/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Github, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface GitHubPagesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesGuideModal: React.FC<GitHubPagesGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static web application
        run: npm run build

      - name: Upload artifact for GitHub Pages
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const handleCopyWorkflow = () => {
    soundEffects.playSelect();
    navigator.clipboard.writeText(workflowContent);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#091428] border border-[#785A28] rounded-xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#111827] border border-slate-700 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech">
                Guide de Déploiement GitHub Pages
              </h3>
              <p className="text-xs text-slate-400">
                Déploiement statique gratuit et automatisé en 3 étapes avec GitHub Actions
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
        <div className="overflow-y-auto py-4 space-y-4 text-xs pr-1">
          
          <div className="p-3.5 rounded-lg bg-[#050B14] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-[#0AC8B9] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#0AC8B9]/20 text-[#0AC8B9] flex items-center justify-center font-mono text-[11px]">1</span>
              <span>Le fichier Workflow GitHub Actions est déjà généré dans le projet</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-7">
              Le fichier <code className="text-[#C8AA6E] font-mono">.github/workflows/deploy.yml</code> est déjà créé à la racine de votre projet. Il compile automatiquement le projet React Vite avec <code className="text-slate-200 font-mono">npm run build</code> et déploie le dossier <code className="text-slate-200 font-mono">dist/</code> vers GitHub Pages.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050B14] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-[#C8AA6E] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#C8AA6E]/20 text-[#C8AA6E] flex items-center justify-center font-mono text-[11px]">2</span>
              <span>Activer GitHub Pages dans les réglages du dépôt</span>
            </div>
            <ol className="list-decimal list-inside pl-2 space-y-1 text-slate-300 leading-relaxed">
              <li>Rendez-vous sur votre dépôt GitHub : <strong>Settings &gt; Pages</strong></li>
              <li>Sous <strong>Build and deployment &gt; Source</strong>, sélectionnez : <strong>GitHub Actions</strong></li>
              <li>Aucune branche manuelle n'est requise : l'action s'occupe de tout !</li>
            </ol>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050B14] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[11px]">3</span>
              <span>Commandes Git pour pousser votre projet</span>
            </div>
            <div className="bg-[#030712] p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>git add .</div>
              <div>git commit -m "feat: LoL Hextech Advisor avec builds Gemini"</div>
              <div>git branch -M main</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* Workflow Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-mono text-[11px]">Contenu de .github/workflows/deploy.yml :</span>
              <button
                onClick={handleCopyWorkflow}
                className="flex items-center gap-1 text-[11px] text-[#C8AA6E] hover:underline"
              >
                {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorkflow ? 'Copié !' : 'Copier le YAML'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#030712] border border-slate-800 rounded text-[10px] text-slate-400 overflow-x-auto font-mono max-h-36">
              {workflowContent}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="px-4 py-2 text-xs font-bold text-[#091428] bg-gradient-to-r from-[#C8AA6E] to-[#F0E6D2] hover:brightness-110 rounded-lg transition-all"
          >
            Compris, fermer
          </button>
        </div>

      </div>
    </div>
  );
};
