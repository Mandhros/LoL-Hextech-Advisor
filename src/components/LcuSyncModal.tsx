/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Terminal, 
  Copy, 
  Check, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  ShieldAlert,
  FileCode2,
  ExternalLink
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { lcuSyncService } from '../services/lcuSyncService';
import { DraftState } from '../types/lol';

interface LcuSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (draft: DraftState) => void;
}

export const LcuSyncModal: React.FC<LcuSyncModalProps> = ({ isOpen, onClose, onApplyDraft }) => {
  const [activeTab, setActiveTab] = useState<'powershell' | 'script' | 'paste'>('powershell');
  const [sessionJson, setSessionJson] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [isCheckingBridge, setIsCheckingBridge] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkBridgeConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const powerShellCommand = `$lock = Get-Content "C:\\Riot Games\\League of Legends\\lockfile" -Raw
$p = $lock.Split(':')[2]
$pass = $lock.Split(':')[3]
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("riot:$pass"))
(Invoke-RestMethod -Uri "https://127.0.0.1:$p/lol-champ-select/v1/session" -Headers @{Authorization="Basic $auth"} -SkipCertificateCheck) | ConvertTo-Json -Depth 10 | Set-Clipboard
Write-Host "Draft LoL copiee dans le presse-papier !" -ForegroundColor Green`;

  const pythonBridgeScript = `# lol_bridge.py - Passerelle locale ultra-legere (aucun package externe requis)
import urllib.request, ssl, base64, json, http.server, socketserver, os, glob

PORT = 35199
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def get_lcu_session():
    paths = glob.glob("C:/Riot Games/League of Legends/lockfile") + glob.glob(os.path.expanduser("~/Library/Application Support/Riot Games/League of Legends/lockfile"))
    if not paths or not os.path.exists(paths[0]):
        return {"error": "Client LoL non detecte"}
    with open(paths[0]) as f:
        _, _, port, password, _ = f.read().split(":")
    auth = base64.b64encode(f"riot:{password}".encode()).decode()
    req = urllib.request.Request(f"https://127.0.0.1:{port}/lol-champ-select/v1/session", headers={"Authorization": f"Basic {auth}"})
    try:
        with urllib.request.urlopen(req, context=CTX) as r:
            return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(get_lcu_session()).encode())

print(f"Bridge LoL actif sur http://127.0.0.1:{PORT}/session - Laissez cette fenetre ouverte pendant vos parties.")
socketserver.TCPServer(("127.0.0.1", PORT), Handler).serve_forever()`;

  const handleCopyCommand = () => {
    soundEffects.playSelect();
    navigator.clipboard.writeText(powerShellCommand);
    setIsCopiedCommand(true);
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  const handleCopyScript = () => {
    soundEffects.playSelect();
    navigator.clipboard.writeText(pythonBridgeScript);
    setIsCopiedScript(true);
    setTimeout(() => setIsCopiedScript(false), 2000);
  };

  const handleParsePastedJson = (customText?: string) => {
    soundEffects.playSelect();
    const textToParse = customText || sessionJson;
    if (!textToParse.trim()) {
      setStatusMessage({ type: 'error', text: 'Veuillez coller le JSON de session LCU ou charger la démo.' });
      return;
    }

    try {
      const data = JSON.parse(textToParse);
      const res = lcuSyncService.parseLcuSession(data);
      if (res.success && res.draft) {
        soundEffects.playLockIn();
        setStatusMessage({ type: 'success', text: res.message });
        onApplyDraft(res.draft);
        setTimeout(() => onClose(), 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Format JSON invalide. Assurez-vous de coller la réponse brute de la commande.' });
    }
  };

  const handleLoadDemo = () => {
    soundEffects.playSelect();
    const demo = lcuSyncService.getDemoLcuSession();
    const formatted = JSON.stringify(demo, null, 2);
    setSessionJson(formatted);
    handleParsePastedJson(formatted);
  };

  const checkBridgeConnection = async () => {
    setIsCheckingBridge(true);
    const res = await lcuSyncService.fetchFromLocalBridge();
    setIsCheckingBridge(false);
    if (res.success && res.draft) {
      setIsLiveActive(true);
      setStatusMessage({ type: 'success', text: 'Pont local détecté ! Synchronisation active avec le client LoL.' });
      onApplyDraft(res.draft);
    } else {
      setIsLiveActive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#091428] border border-[#785A28] rounded-xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0AC8B9]/15 border border-[#0AC8B9]/40 flex items-center justify-center text-[#0AC8B9]">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F0E6D2] font-hextech tracking-wide">
                  Connexion Client LoL (LCU Auto-Fill)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0AC8B9]/20 text-[#0AC8B9] border border-[#0AC8B9]/40">
                  LCU API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pré-remplissage automatique des picks, bans et rôles en direct depuis votre client League of Legends
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

        {/* Explication technique transparente */}
        <div className="my-3 p-3 rounded-lg bg-[#050B14] border border-amber-500/30 flex items-start gap-3 text-xs shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-300">
            <span className="font-bold text-amber-300">Pourquoi cette étape est requise :</span>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Le client League of Legends (LCU) tourne en local sur votre PC protégé par un certificat HTTPS auto-signé. Par sécurité, les navigateurs web (sur GitHub Pages) bloquent les accès directs au disque dur et à l'adresse 127.0.0.1 (règles CORS et SSL). Deux méthodes simples et conformes à Riot permettent de contourner cela :
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 mb-3 shrink-0">
          <button
            onClick={() => { soundEffects.playSelect(); setActiveTab('powershell'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'powershell'
                ? 'bg-[#0AC8B9]/20 text-[#0AC8B9] border border-[#0AC8B9]/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Commande 1-Clic (Rapide)</span>
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); setActiveTab('script'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'script'
                ? 'bg-[#C8AA6E]/20 text-[#C8AA6E] border border-[#C8AA6E]/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Pont Automatique Temps Réel (Script)</span>
          </button>

          <button
            onClick={() => { soundEffects.playSelect(); setActiveTab('paste'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>3. Coller le JSON / Démo</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
          
          {/* TAB 1: PowerShell Command */}
          {activeTab === 'powershell' && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-slate-300 leading-relaxed">
                Pendant que vous êtes dans la sélection des champions (Champ Select LoL), ouvrez <strong>PowerShell</strong> (ou Terminal) et collez cette commande. Elle extrait instantanément votre draft et la copie dans votre presse-papier :
              </p>

              <div className="relative">
                <pre className="p-3 bg-[#030712] border border-slate-800 rounded-lg text-[11px] text-cyan-300 font-mono overflow-x-auto leading-relaxed max-h-36">
                  {powerShellCommand}
                </pre>
                <button
                  onClick={handleCopyCommand}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#091428] border border-slate-700 hover:border-[#0AC8B9] text-[#0AC8B9] flex items-center gap-1.5 text-[11px] shadow transition-all"
                >
                  {isCopiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedCommand ? 'Copié !' : 'Copier la commande'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#050B14] border border-slate-800 space-y-2">
                <span className="font-bold text-[#F0E6D2]">Ensuite, collez le résultat ci-dessous :</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sessionJson}
                    onChange={(e) => setSessionJson(e.target.value)}
                    placeholder="Collez ici (Ctrl + V) le résultat copié par la commande..."
                    className="flex-1 bg-[#091428] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0AC8B9]"
                  />
                  <button
                    onClick={() => handleParsePastedJson()}
                    className="px-4 py-2 bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-white font-bold rounded-lg hover:brightness-110 flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Remplir la Draft</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Python / Node Companion Script */}
          {activeTab === 'script' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <p className="text-slate-300 leading-relaxed">
                  Ce mini-script Python (30 lignes) agit comme un pont local ultra-léger. Dès qu'il est lancé, cette page web se synchronise <strong>en continu et automatiquement</strong> sans rien copier/coller :
                </p>
                <button
                  onClick={checkBridgeConnection}
                  disabled={isCheckingBridge}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050B14] border border-slate-700 hover:border-[#C8AA6E] text-[#C8AA6E] text-[11px] shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingBridge ? 'animate-spin' : ''}`} />
                  <span>Tester le pont</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-3 bg-[#030712] border border-slate-800 rounded-lg text-[10px] text-amber-200/90 font-mono overflow-x-auto max-h-48 leading-relaxed">
                  {pythonBridgeScript}
                </pre>
                <button
                  onClick={handleCopyScript}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#091428] border border-slate-700 hover:border-[#C8AA6E] text-[#C8AA6E] flex items-center gap-1.5 text-[11px] shadow transition-all"
                >
                  {isCopiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedScript ? 'Script Copié !' : 'Copier lol_bridge.py'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-[#050B14] border border-slate-800 text-slate-300 text-[11px] space-y-1">
                <p><strong>Utilisation :</strong></p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5 text-slate-400">
                  <li>Enregistrez le code dans un fichier nommé <code className="text-white">lol_bridge.py</code></li>
                  <li>Lancez-le avec la commande : <code className="text-[#0AC8B9]">python lol_bridge.py</code></li>
                  <li>La web app détectera automatiquement vos champions en temps réel !</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Coller Brut / Mode Démo */}
          {activeTab === 'paste' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Collez directement l'objet JSON ou essayez la démo :</span>
                <button
                  onClick={handleLoadDemo}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Charger une Démo Immédiate</span>
                </button>
              </div>

              <textarea
                value={sessionJson}
                onChange={(e) => setSessionJson(e.target.value)}
                rows={6}
                placeholder="Collez ici le JSON complet de session LCU (issu de /lol-champ-select/v1/session)..."
                className="w-full bg-[#030712] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-[#0AC8B9]"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSessionJson('')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                >
                  Effacer
                </button>
                <button
                  onClick={() => handleParsePastedJson()}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#0AC8B9] to-[#005A82] text-white font-bold hover:brightness-110 flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Analyser et Remplir</span>
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                : statusMessage.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
            }`}>
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
              <span className="text-[11px] leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-slate-400">
              {isLiveActive ? 'Pont LCU connecté' : 'Pont LCU en attente'}
            </span>
          </div>

          <button
            onClick={() => { soundEffects.playSelect(); onClose(); }}
            className="px-4 py-2 text-xs font-bold text-[#F0E6D2] hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
