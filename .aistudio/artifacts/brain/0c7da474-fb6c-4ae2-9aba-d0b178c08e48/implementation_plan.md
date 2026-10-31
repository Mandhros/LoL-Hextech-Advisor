# LoL Hextech Advisor - Assistant de Builds & Draft League of Legends

Application web interactive de Draft et Générateur de 5 Builds adaptatifs pour League of Legends, combinant les données officielles Riot Data Dragon et l'intelligence artificielle Google Gemini (modèle `gemini-3.8-flash`) pour proposer des stratégies méta et des synergies exotiques viables, avec export statique autonome prêt pour GitHub Pages.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Décisions validées lors de la phase de clarification :**
> - **Architecture & Déploiement :** Single Page Application React 19 + TypeScript + Vite, optimisée pour un hébergement statique à 100% sur **GitHub Pages** (via GitHub Actions automatisé) avec gestion locale et sécurisée de la clé Gemini (`localStorage` chiffré/session + fallback proxy serveur en développement).
> - **Données League of Legends :** Stratégie hybride combinant un catalogue local de secours instantané et une synchronisation automatique en direct avec le CDN officiel Riot Data Dragon (détection du dernier patch actif, portraits champions, icônes d'objets, arbres de runes et sorts).
> - **Langue & Terminologie :** Interface entièrement en français avec le vocabulaire compétitif usuel des invocateurs (AD, AP, Roam, Poke, Engage, Peel, Power Spike, Scaling, Win Condition).

---

### 1. Overview & Core Concept

- **Ce que fait l'application :** 
  1. **Simulateur de Champion Select :** Permet de composer l'équipe alliée et l'équipe ennemie avec attribution des rôles (Top, Jungle, Mid, ADC, Support) et de choisir son champion.
  2. **Générateur de 5 Builds Adaptatifs :**
     - **Build 1 (Meta Patch) :** Build standard optimisé d'après les taux de victoire statistiques du patch.
     - **Build 2 (Matchup / Anti-Comp A) :** Build axé sur la survie ou le contre direct de la composition adverse (ex: Armor/MR stack, Anti-Burst, Tenacity).
     - **Build 3 (Matchup / Style Spécifique B) :** Build alternatif orienté playstyle (ex: Splitpush duelliste, Poke lourd ou Full Ability Haste).
     - **Builds 4 & 5 (Exotiques & Viables - Signature Gemini) :** Conceptions surprenantes mais mécaniquement rigoureuses exploitant des scalings hybrides, des passifs d'items méconnus, ou des interactions de sorts cachées générées via `gemini-3.8-flash`.
  3. **Assistant de Draft & Suggestions Exotiques :** Recommandation de champions et de contre-picks surprises adaptés à la composition des deux équipes.
  4. **Détails complets de chaque build :** Ordre d'achat des items (Starter, Core, Situationnels, Bottes), ordre de max des sorts niveau par niveau (1 à 18), configuration complète des runes (Principale, Secondaire, Éclats) et note tactique de Gemini expliquant la condition de victoire.
- **Public cible :** Joueurs de LoL en parties classées (SoloQ / Flex / Clash), theorycrafters et créateurs de contenu cherchant un avantage stratégique en draft ou des builds originaux à jouer.
- **Valeur ajoutée :** Fini les builds génériques copier-coller : l'application offre une adaptation chirurgicale à chaque composition et réinvente le plaisir de jeu grâce à des builds exotiques réellement jouables.

---

### 2. User Experience & Visual Design

#### Visual Identity & Hextech Design System
- **Ambiance :** Dark Mode immersif inspiré du client de jeu League of Legends (Hextech & Cybernétique Zaun/Piltover).
- **Palette de couleurs (Règle 60-30-10) :**
  - **60% Fond & Toile Neutre :** Noir bleuté profond des abysses de Runeterra (`#030712`, `#091428`, `#0B101B`).
  - **30% Surfaces & Conteneurs :** Ardoise métallique sombre (`#111827`, `#1E2328`) avec bordures biseautées dorées discrètes (`#C8AA6E`, `#785A28`).
  - **10% Accents & États :**
    - Bleu Hextech magique (`#0AC8B9`, `#005A82`) pour les actions principales et sélections.
    - Or antique (`#F0E6D2`, `#C89B3C`) pour les titres et ornements.
    - Rouge écarlate de bannissement (`#E84057`) pour les ennemis et contres.
- **Typographie :**
  - Titres & Marques : `Plus Jakarta Sans` / `Cinzel` avec graisse affirmée (700).
  - Corps de texte : `Plus Jakarta Sans` (400-500) pour une lisibilité parfaite.
  - Statistiques, cooldowns et chiffres de patch : `JetBrains Mono` en chiffres tabulaires (`tabular-nums`).
- **Composants & Ergonomie :**
  - Grille de sélection de champions avec recherche instantanée, filtres de rôle (Top, Jungle, Mid, Bot, Sup) et tri par ordre alphabétique ou difficulté.
  - Arène de Draft 5v5 (Équipe Bleue vs Équipe Rouge) avec portrait circulaire/hexagonal, badge de rôle et sélection interactive en un clic.
  - Onglets de builds segmentés sans badges criards, navigation fluide entre les 5 variantes.
  - Fiche de build intuitive : affichage grand format des icônes officielles d'objets Riot avec infobulles de statistiques, arbre de runes interactif avec branches colorées officielles (Précision, Domination, Sorcellerie, Volonté, Inspiration), et grille d'attribution des sorts (Niveaux 1 à 18).

---

### 3. Key Product Decisions & Trade-Offs

- **Décision 1 : Export GitHub Pages 100% Statique avec GitHub Actions**
  - *Choix retenu :* Code TypeScript/React compilé sous Vite générant un bundle statique autonome dans `dist/`. La clé Gemini peut être renseignée via une modale sécurisée enregistrée en mémoire de navigation ou `localStorage`. En environnement de développement AI Studio, un endpoint proxy Express (`/api/gemini`) est également fourni pour le test immédiat avec la clé secrète injectée.
  - *Bénéfice :* Déploiement gratuit, instantané et sans serveur sur n'importe quel dépôt GitHub en activant simplement GitHub Pages via l'action fournie `.github/workflows/deploy.yml`.
- **Décision 2 : Algorithme de Génération Hybride (Règles Déterministes + Gemini 3.8 Flash)**
  - *Choix retenu :* Les Builds 1, 2 et 3 sont calculés par un moteur de règles LoL déterministe (qui analyse les types de dégâts AD/AP de la comp adverse, le contrôle de foule, et la méta) afin de garantir une latence immédiate. Les Builds 4 et 5 sont propulsés par l'API Gemini 3.8 Flash avec un schéma JSON strict (`responseSchema`) garantissant des objets, runes et explications cohérents avec le patch officiel.
  - *Bénéfice :* Réactivité instantanée sur les premiers builds, coût API optimisé, et créativité stratégique maximale pour les builds exotiques.
- **Décision 3 : Gestionnaire de Cache Data Dragon & Fallback Hors-ligne**
  - *Choix retenu :* Service `riotDataService` qui interroge d'abord la dernière version de patch Riot (ex: `14.x` ou `15.x`), met en cache les données dans le navigateur (IndexedDB / localStorage), et intègre un jeu de données par défaut de champions et d'objets pour éviter tout blocage réseau ou erreur CORS.

---

### 4. Technical Architecture & Data Strategy

#### Schéma d'Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LoL Hextech Advisor SPA                         │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (Brand Wordmark · Champ Select · Draft · Settings)     │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Panneau de Draft 5v5        │         Panneau de Résultats        │
│  - Équipe Bleue (Alliés 1-5)     │  ┌────────────────────────────────┐ │
│  - Équipe Rouge (Ennemis 1-5)    │  │ 5 Onglets de Builds Dynamiques │ │
│  - Sélecteur de Rôle Actif       │  ├────────────────────────────────┤ │
│  - Grille de Champions & Recherche│  │ Build 1 : Méta Patch           │ │
│                                  │  │ Build 2 : Anti-Comp Tank/Def   │ │
│                                  │  │ Build 3 : Spécifique Playstyle │ │
│                                  │  │ Build 4 : Exotique Viable #1   │ │
│                                  │  │ Build 5 : Exotique Viable #2   │ │
│                                  │  ├────────────────────────────────┤ │
│                                  │  │ Items · Runes · Skills 1-18    │ │
│                                  │  │ Note Tactique & Astuce Gemini  │ │
│                                  │  └────────────────────────────────┘ │
├──────────────────────────────────┴─────────────────────────────────────┤
│  Services Métier :                                                     │
│  - riotDataService (Data Dragon CDN + Fallback)                        │
│  - geminiService (Proxy /api/gemini ou Appel Direct Client si configuré)│
│  - buildEngine (Moteur de règles & analyse de composition AD/AP/CC)    │
│  - storageService (Sauvegarde locale des builds favoris & clés)        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Modèles de Données TypeScript Principaux

```typescript
// Roles compétitifs
export type LoLRole = 'TOP' | 'JUNGLE' | 'MID' | 'BOTTOM' | 'SUPPORT';

// Données d'un Champion Riot
export interface LoLChampion {
  id: string;            // ex: 'Aatrox', 'Yasuo'
  key: string;           // ex: '266'
  name: string;          // Nom affiché
  title: string;         // 'l'Épée des Darkin'
  roles: LoLRole[];
  tags: string[];        // ['Fighter', 'Tank']
  iconUrl: string;
  splashUrl: string;
  stats: {
    hp: number;
    mp: number;
    armor: number;
    spellblock: number;
    attackdamage: number;
  };
  spells: {
    id: string;
    key: 'Q' | 'W' | 'E' | 'R' | 'P';
    name: string;
    description: string;
    iconUrl: string;
  }[];
}

// Objet / Item LoL
export interface LoLItem {
  id: string;
  name: string;
  description: string;
  gold: number;
  tags: string[];
  iconUrl: string;
  isMythicOrLegendary?: boolean;
}

// Configuration de Runes
export interface RuneSelection {
  primaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  primaryKeystone: string;
  primarySlots: string[];
  secondaryTree: 'Precision' | 'Domination' | 'Sorcery' | 'Resolve' | 'Inspiration';
  secondarySlots: string[];
  shards: {
    offense: string;
    flex: string;
    defense: string;
  };
}

// Structure complète d'un Build généré
export interface LoLBuild {
  id: string;
  type: 'META' | 'COUNTER_SURVIVAL' | 'COUNTER_PLAYSTYLE' | 'EXOTIC_1' | 'EXOTIC_2';
  title: string;
  tagline: string;
  description: string;
  winCondition: string;
  powerSpikes: string[];
  starterItems: LoLItem[];
  coreItems: LoLItem[];
  situationalItems: LoLItem[];
  boots: LoLItem;
  runes: RuneSelection;
  skillOrder: ('Q' | 'W' | 'E' | 'R')[]; // 18 éléments pour les niveaux 1 à 18
  geminiTips: {
    combo: string;
    synergyHook: string;
    warningTrap: string;
  };
}

// État de la Draft 5v5
export interface DraftState {
  playerRole: LoLRole;
  playerChampion: LoLChampion | null;
  allies: Record<LoLRole, LoLChampion | null>;
  enemies: Record<LoLRole, LoLChampion | null>;
}
```

#### GitHub Actions pour déploiement GitHub Pages (`.github/workflows/deploy.yml`)
Le plan inclut la création d'un fichier de workflow standard pour déployer automatiquement le build statique sur la branche `gh-pages` ou via GitHub Pages Artifacts à chaque commit sur `main`.

---

### Prochaines étapes après validation
1. **Échafaudage de l'architecture :** Mise en place des dossiers (`/src/types`, `/src/services`, `/src/data`, `/src/components`, `/src/hooks`).
2. **Implémentation du jeu de données Riot :** Intégration du catalogue de champions/items/runes avec connecteur Data Dragon CDN dynamique et secours local.
3. **Moteur d'analyse & Générateur de 5 Builds :** Moteur d'analyse de composition et connecteur Gemini 3.8 Flash pour les builds exotiques viables.
4. **Interface utilisateur Hextech :** Simulateur de Champ Select, draft board 5v5, filtres par rôle et vue détaillée des 5 builds.
5. **Vérification & Export GitHub Pages :** Configuration du build statique, test de compilation et fichier GitHub Actions.
