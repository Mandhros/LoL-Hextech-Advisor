# LoL Hextech Advisor & Coaching Compétitif (Édition Pro DPM & Draft)

Application web interactive de Draft 5v5, d'analyse de matchup dpm.lol et de génération de 5 builds adaptatifs pour League of Legends.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Ajustements validés avec l'utilisateur :**
> - **Suppression du mode Second Écran :** Retrait complet de la vue et des composants d'accompagnement en jeu (In-Game HUD) pour recentrer l'expérience sur la Draft, l'analyse comparative DPM et la consultation des Builds.
> - **Arrêt de l'auto-génération API en boucle :** Découplage complet de la génération des builds. Les 5 builds s'affichent instantanément en local sans aucun appel réseau. L'appel à Gemini AI est désormais **strictement manuel** (bouton dédié) et protégé par un cache mémoire avec déduplication de requêtes pour stopper toute surconsommation de jetons et de quota API.

---

### 1. Vue d'Ensemble & Fonctionnalités

1. **Simulateur de Draft 5v5 & Bans :** Saisie instantanée des 10 champions et des 10 bans avec détection des champions indisponibles.
2. **Matrice de Matchup & DPM Direct (Inspirée de dpm.lol) :**
   - Comparateur direct sur la lane entre votre champion et l'adversaire.
   - Différentiels projetés de DPM, GD@15 (Gold Diff à 15m), CSD@15 (CS Diff à 15m).
   - Jauge de dominance de lane, profil de scaling, conseils tactiques et alertes de danger.
3. **Générateur de 5 Builds Instantanés :**
   - **Build 1 (Méta Pure) :** Statistiquement le plus régulier avec starter de rôle rigoureux (Atlas pour Support, Bébés pour Jungle).
   - **Build 2 (Anti-Comp Défensif) :** Adaptation aux dégâts majoritaires ennemis (Armure vs Magie vs CC).
   - **Build 3 (Offensif / Playstyle) :** Dégâts et duels poussés au maximum.
   - **Builds 4 & 5 (Exotiques & Signature Cheese) :** Synergies cachées et builds inattendus basés sur une base theorycrafting locale, optimisables à la demande via Gemini AI.
4. **Base de Données & Stats Riot :** Consultation des champions et objets avec vrais sorts officiels chargés depuis DataDragon.

---

### 2. Architecture Technique & Protection Quota API

- **Génération Locale Déterministe :** Calcul local en 0ms des 5 configurations dès le choix du champion ou changement de lane.
- **Cache Gemini In-Memory :** Si l'utilisateur clique sur « Régénérer Exotiques », le résultat est mémorisé par clé unique `champion_role_enemies` pour éliminer toute requête redondante.
- **Lock In-Flight :** Aucune double requête simultanée possible sur le serveur proxy ou client direct.
