/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialisation du client Google GenAI selon les recommandations officielles AI Studio
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Route POST /api/gemini/exotic-builds
 * Génère les 2 Builds Exotiques & Viables (Builds 4 & 5) STRICTEMENT POUR LE CHAMPION SÉLECTIONNÉ
 */
app.post('/api/gemini/exotic-builds', async (req, res) => {
  try {
    const { champion, role, allies, enemies, compAnalysis } = req.body;

    if (!champion || !champion.name) {
      return res.status(400).json({ error: 'Champion requis.' });
    }

    if (!apiKey) {
      return res.status(503).json({ 
        error: 'GEMINI_API_KEY non configurée sur le serveur. Mode fallback activé.',
        fallback: true 
      });
    }

    const enemyList = enemies ? Object.entries(enemies).map(([r, c]: [string, any]) => `${r}: ${c ? c.name : 'Inconnu'}`).join(', ') : 'Inconnu';
    const allyList = allies ? Object.entries(allies).map(([r, c]: [string, any]) => `${r}: ${c ? c.name : 'Inconnu'}`).join(', ') : 'Inconnu';

    const systemPrompt = `Tu es un grand maître du theorycrafting sur League of Legends (LoL, patch actuel) et coach d'élite d'esport.

RÈGLE IMPÉRATIVE N°1 : Tu DOIS concevoir les builds STRICTEMENT ET EXCLUSIVEMENT POUR LE CHAMPION "${champion.name}" (${champion.title}) qui joue au poste de : ${role}.
IL EST STRICTEMENT INTERDIT de concevoir un build pour un allié ou pour un ennemi. Tout le kit, les sorts, et la stratégie doivent concerner UNIQUEMENT ${champion.name} SUR LA LANE ${role}.

RÈGLE IMPÉRATIVE N°2 : RESPECT DES DEUX CATÉGORIES EXACTES :
- Le 1er build (Build 4) DOIT ÊTRE : "BUILD 4 : EXOTIQUE VIABLE" -> Une synergie cachée, un ratio inattendu ou un passif d'objet méconnu qui reste TRÈS VIABLE et compétitif sur la lane ${role}.
- Le 2ème build (Build 5) DOIT ÊTRE : "BUILD 5 : SIGNATURE CHEESE" -> Un pick surprise extrême / cheese audacieux conçu pour surprendre et déstabiliser l'adversaire dès le niveau 1-3 sur la lane ${role}.

RÈGLE SUR LES OBJETS DE DÉPART :
- Si ${role} === "SUPPORT" : le starter doit impérativement être "Atlas des mondes" (ou son évolution Chant de sang / Boussole).
- Si ${role} === "JUNGLE" : le starter doit impérativement être "Bébé saute-nuages" ou "Bébé écraseur".
- Fournir l'inventaire COMPLET à 6 objets (1 Bottes + 3 Core Items + 2 Derniers Objets Majeurs / Late Game).
- Rédigé en FRANÇAIS avec le vocabulaire compétitif usuel de LoL (AD, AP, Roam, Poke, Burst, Scaling, Power Spike).`;

    const userPrompt = `Champion CIBLE EXCLUSIF : ${champion.name} (${champion.title})
Rôle / Lane jouée : ${role}
Équipe alliée : ${allyList}
Équipe ennemie : ${enemyList}
Analyse dégâts ennemis : ${compAnalysis ? `${compAnalysis.enemyDamageSplit?.adPercentage}% AD, ${compAnalysis.enemyDamageSplit?.apPercentage}% AP` : 'Standard'}

Génère EXACTEMENT 2 builds UNIQUEMENT POUR ${champion.name} en ${role} sous format JSON strict :
1er objet JSON : Build 4 (badgeLabel: "BUILD 4 : EXOTIQUE VIABLE")
2ème objet JSON : Build 5 (badgeLabel: "BUILD 5 : SIGNATURE CHEESE")

Pour chacun :
- title : titre percutant mentionnant ${champion.name} et l'esprit du build en ${role}
- tagline : résumé de l'esprit du build en 1 phrase
- badgeLabel : "BUILD 4 : EXOTIQUE VIABLE" pour le premier, "BUILD 5 : SIGNATURE CHEESE" pour le second
- description : pourquoi ce build fonctionne mécaniquement sur ${champion.name} en ${role}
- winCondition : condition de victoire
- powerSpikes : tableau de 3 moments clés de puissance
- starterItemName : nom du starter adapté à la lane ${role}
- bootsName : nom des bottes recommandées
- coreItemNames : tableau de 3 noms d'objets majeurs (Slots 2, 3, 4)
- lateItemNames : tableau de 2 noms d'objets finaux pour achever le build à 6 objets (Slots 5, 6)
- situationalItemNames : tableau de 2 noms d'objets situationnels de remplacement
- primaryTree : l'un de "Precision", "Domination", "Sorcery", "Resolve", "Inspiration"
- primaryKeystoneName : nom de la rune fondamentale
- primarySlotNames : tableau de 3 runes de la branche principale
- secondaryTree : l'un de "Precision", "Domination", "Sorcery", "Resolve", "Inspiration"
- secondarySlotNames : tableau de 2 runes de la branche secondaire
- skillOrder : tableau de 18 lettres parmi 'Q', 'W', 'E', 'R' (ordre niveau 1 à 18)
- comboTip : astuce d'exécution ou mécanique secrète sur ${champion.name}
- synergyHook : synergie avec un allié ou contre un ennemi
- warningTrap : piège ou erreur à éviter absolument sur ${champion.name}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tagline: { type: Type.STRING },
                badgeLabel: { type: Type.STRING },
                description: { type: Type.STRING },
                winCondition: { type: Type.STRING },
                powerSpikes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                starterItemName: { type: Type.STRING },
                bootsName: { type: Type.STRING },
                coreItemNames: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                lateItemNames: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                situationalItemNames: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                primaryTree: { type: Type.STRING },
                primaryKeystoneName: { type: Type.STRING },
                primarySlotNames: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                secondaryTree: { type: Type.STRING },
                secondarySlotNames: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                skillOrder: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                comboTip: { type: Type.STRING },
                synergyHook: { type: Type.STRING },
                warningTrap: { type: Type.STRING }
              },
              required: [
                'title', 'tagline', 'badgeLabel', 'description', 'winCondition',
                'powerSpikes', 'starterItemName', 'bootsName', 'coreItemNames',
                'lateItemNames', 'primaryTree', 'primaryKeystoneName', 'comboTip', 'synergyHook'
              ]
            }
          }
        }
      });
    } catch (modelErr: any) {
      console.warn('Tentative alternative avec gemini-3.1-flash-lite pour exotic-builds...');
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        }
      });
    }

    const rawText = response.text || '[]';
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const parsedBuilds = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    return res.json({ builds: parsedBuilds });
  } catch (error: any) {
    console.warn('Mode fallback activé pour exotic-builds (quota ou indisponibilité API):', error?.message || error);
    return res.json({ builds: [], fallback: true, error: error?.message || 'Fallback local actif' });
  }
});

/**
 * Route POST /api/gemini/draft-recommendations
 * Recommande des champions et contre-picks avec exclusion stricte des champions déjà pris ou bannis
 */
app.post('/api/gemini/draft-recommendations', async (req, res) => {
  try {
    const { playerRole, allies, enemies, bans } = req.body;

    if (!apiKey) {
      return res.status(503).json({ 
        error: 'GEMINI_API_KEY non configurée.',
        fallback: true 
      });
    }

    // Récupérer la liste des champions DÉJÀ PRIS ou BANNIS pour interdiction formelle
    const allyNames: string[] = allies ? Object.values(allies).filter(Boolean).map((c: any) => c.name) : [];
    const enemyNames: string[] = enemies ? Object.values(enemies).filter(Boolean).map((c: any) => c.name) : [];
    const banBlueNames: string[] = bans?.blue ? bans.blue.filter(Boolean).map((c: any) => c.name) : [];
    const banRedNames: string[] = bans?.red ? bans.red.filter(Boolean).map((c: any) => c.name) : [];

    const forbiddenNames = Array.from(new Set([...allyNames, ...enemyNames, ...banBlueNames, ...banRedNames]));
    const forbiddenListStr = forbiddenNames.length > 0 ? forbiddenNames.join(', ') : 'Aucun';

    const enemyList = enemies ? Object.entries(enemies).map(([r, c]: [string, any]) => `${r}: ${c ? c.name : 'Vide'}`).join(', ') : 'Aucun';
    const allyList = allies ? Object.entries(allies).map(([r, c]: [string, any]) => `${r}: ${c ? c.name : 'Vide'}`).join(', ') : 'Aucun';
    const bansList = forbiddenListStr;

    const systemPrompt = `Tu es un coach d'esport d'élite de League of Legends expert en Champion Select (Draft 5v5).
RÈGLE ABSOLUE ET INVIOLABLE :
Les champions suivants sont DÉJÀ SÉLECTIONNÉS PAR L'UNE DES ÉQUIPES OU BANNIS :
[${forbiddenListStr}]

IL EST STRICTEMENT INTERDIT DE RECOMMANDER UN CHAMPION QUI FIGURE DANS CETTE LISTE.
Tu dois proposer UNIQUEMENT des champions DISPONIBLES pour le rôle : ${playerRole}.`;

    const userPrompt = `Rôle du joueur à combler : ${playerRole}
Composition Alliée : ${allyList}
Composition Ennemie : ${enemyList}
Champions Bannis et Déjà Sélectionnés (INTERDITS) : ${bansList}

Suggère EXACTEMENT 3 champions DISPONIBLES et NON BANNIS pour le rôle ${playerRole} :
1. Un contre-pick direct de la comp ennemie (type: "COUNTER")
2. Une synergie puissante avec les alliés (type: "SYNERGY")
3. Un pick surprise avec un build exotique cheese très dévastateur (type: "EXOTIC_CHEESE")

Pour chaque champion :
- championName : nom officiel exact du champion (ex: "Aatrox", "Ahri", "Viego", etc. INTERDIT si déjà dans la liste des interdits !)
- synergyType : "COUNTER" | "SYNERGY" | "EXOTIC_CHEESE"
- score : note de pertinence sur 100
- reason : explication claire et concise en français (max 2 phrases)
- exoticBuildHook : nom et brève description de l'approche de build exotique associée`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                championName: { type: Type.STRING },
                synergyType: { type: Type.STRING },
                score: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                exoticBuildHook: { type: Type.STRING }
              },
              required: ['championName', 'synergyType', 'score', 'reason', 'exoticBuildHook']
            }
          }
        }
      });
    } catch (modelErr: any) {
      console.warn('Tentative alternative avec gemini-3.1-flash-lite pour draft-recommendations...');
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        }
      });
    }

    const rawText = response.text || '[]';
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const rawSuggestions = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    // Filtre de sécurité strict côté serveur : exclure tout champion interdit qui aurait fuité
    const forbiddenLower = new Set(forbiddenNames.map(n => n.toLowerCase()));
    const validSuggestions = rawSuggestions.filter((s: any) => 
      s.championName && !forbiddenLower.has(s.championName.toLowerCase())
    );

    return res.json({ suggestions: validSuggestions });
  } catch (error: any) {
    console.warn('Mode fallback activé pour draft-recommendations (quota ou indisponibilité API):', error?.message || error);
    return res.json({ suggestions: [], fallback: true, error: error?.message || 'Fallback local actif' });
  }
});

// Middleware Vite en développement
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode production statique
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LoL Hextech Advisor backend actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
