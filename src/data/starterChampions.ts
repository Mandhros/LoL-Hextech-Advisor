/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoLChampion } from '../types/lol';

const CDN = 'https://ddragon.leagueoflegends.com/cdn/14.23.1';
const IMG_CDN = 'https://ddragon.leagueoflegends.com/cdn/img/champion';

export const STARTER_CHAMPIONS: LoLChampion[] = [
  // TOP LANERS
  {
    id: 'Aatrox',
    key: '266',
    name: 'Aatrox',
    title: "l'Épée des Darkin",
    blurb: 'Jadis de nobles défenseurs de Shurima contre le Néant, Aatrox et ses frères devinrent une menace pire encore pour Runeterra.',
    roles: ['TOP'],
    tags: ['Fighter', 'Tank'],
    iconUrl: `${CDN}/img/champion/Aatrox.png`,
    splashUrl: `${IMG_CDN}/splash/Aatrox_0.jpg`,
    stats: { hp: 650, hpperlevel: 114, mp: 0, armor: 38, armorperlevel: 4.45, spellblock: 32, attackdamage: 60, attackdamageperlevel: 5, attackspeed: 0.651, movespeed: 345 },
    spells: [
      { id: 'AatroxPassive', key: 'P', name: 'Posture du massacreur', description: 'La prochaine attaque de base inflige des dégâts physiques supplémentaires selon les PV max de la cible et soigne Aatrox à hauteur de 100% des dégâts infligés.', cooldown: '24-12s', cost: 'Sans coût', range: 'Corps-à-corps (+50)', ratios: '4%-12% PV max (+100% AD de base)', iconUrl: `${CDN}/img/passive/Aatrox_Passive.png` },
      { id: 'AatroxQ', key: 'Q', name: 'Épée des Darkin', description: 'Aatrox abat sa lourde épée jusqu\'à trois fois. Chaque coup frappe une zone géométrique spécifique. Le tranchant (sweetspot) projette les cibles en l\'air pendant 0.25s et inflige 60% de dégâts supplémentaires.', cooldown: '14 / 12 / 10 / 8 / 6s', cost: 'Sans coût', range: '650', ratios: '10/25/40/55/70 (+60/70/80/90/100% AD total)', iconUrl: `${CDN}/img/spell/AatroxQ.png` },
      { id: 'AatroxW', key: 'W', name: 'Chaînes infernales', description: 'Frappe le sol, créant une zone qui ralentit le premier ennemi touché de 25%. S\'il ne quitte pas la zone dans les 1.5s, il est ramené de force au centre et subit à nouveau les dégâts.', cooldown: '20 / 18.5 / 17 / 15.5 / 14s', cost: 'Sans coût', range: '825', ratios: '30/40/50/60/70 (+40% AD total)', iconUrl: `${CDN}/img/spell/AatroxW.png` },
      { id: 'AatroxE', key: 'E', name: 'Ruée obscure', description: 'Passif : Confère de l\'omnivampirisme contre les champions. Actif : Ruée dans la direction ciblée, réinitialisant le délai d\'attaque de base et permettant de repositionner le A en plein vol.', cooldown: '9 / 8 / 7 / 6 / 5s', cost: 'Sans coût', range: '300', ratios: 'Soin passif : 16/18/20/22/24% des dégâts infligés', iconUrl: `${CDN}/img/spell/AatroxE.png` },
      { id: 'AatroxR', key: 'R', name: 'Fossoyeur des mondes', description: 'Aatrox libère sa forme démoniaque complète pendant 10s. Terrifie les sbires ennemis proches, gagne de la vitesse de déplacement, augmente son AD totale de 20-40% et amplifie tous ses soins de 25-45%. Participer à une élimination prolonge la durée de 5s.', cooldown: '120 / 100 / 80s', cost: 'Sans coût', range: 'Zone (500)', ratios: '+20/30/40% AD total · Soins accrus +25/35/45%', iconUrl: `${CDN}/img/spell/AatroxR.png` },
    ]
  },
  {
    id: 'Darius',
    key: '122',
    name: 'Darius',
    title: 'la Main de Noxus',
    blurb: 'Symbole suprême de la puissance noxienne, Darius est le chef militaire le plus craint de tout l\'empire.',
    roles: ['TOP'],
    tags: ['Fighter', 'Tank'],
    iconUrl: `${CDN}/img/champion/Darius.png`,
    splashUrl: `${IMG_CDN}/splash/Darius_0.jpg`,
    stats: { hp: 652, hpperlevel: 114, mp: 263, armor: 39, armorperlevel: 5.2, spellblock: 32, attackdamage: 64, attackdamageperlevel: 5, attackspeed: 0.625, movespeed: 340 },
    spells: [
      { id: 'DariusHemorrhage', key: 'P', name: 'Plaie béante', description: 'Les attaques et sorts font saigner la cible pendant 5s (cumulable 5 fois). À 5 charges, Darius entre en Furie noxienne, gagnant 30-230 AD bonus et appliquant instantanément 5 charges à chaque coup.', cooldown: 'Passif continu', cost: 'Sans coût', range: 'Attaque', ratios: '13-30 (+30% AD bonus) par charge · Furie : +30 à 230 AD', iconUrl: `${CDN}/img/passive/Darius_Icon_Hemorrhage.png` },
      { id: 'DariusCleave', key: 'Q', name: 'Décimation', description: 'Darius fait tournoyer sa hache après un court délai de 0.75s. Les ennemis touchés par la lame extérieure subissent de lourds dégâts et soignent Darius de 15% à 45% de ses PV manquants.', cooldown: '9 / 8 / 7 / 6 / 5s', cost: '30 / 35 / 40 / 45 / 50 Mana', range: '425 (Cercle)', ratios: '50/80/110/140/170 (+100/110/120/130/140% AD) · Soin : 15%-45% PV manquants', iconUrl: `${CDN}/img/spell/DariusCleave.png` },
      { id: 'DariusNoxianTactics', key: 'W', name: 'Estropiaison', description: 'La prochaine attaque de base inflige des dégâts physiques augmentés et ralentit violemment l\'ennemi de 90% pendant 1s. Rembourse le coût en mana et 50% du CD si la cible meurt.', cooldown: '5s', cost: '40 Mana', range: 'Attaque (+25)', ratios: '140/145/150/155/160% AD total · Ralentissement : 90%', iconUrl: `${CDN}/img/spell/DariusNoxianTactics.png` },
      { id: 'DariusAxeGrab', key: 'E', name: 'Crampon', description: 'Passif : Confère une pénétration d\'armure passive permanente. Actif : Balaye tous les ennemis devant lui avec le crochet de sa hache pour les attirer à portée et les ralentir de 40%.', cooldown: '24 / 21.5 / 19 / 16.5 / 14s', cost: '45 Mana', range: '535 (Cône)', ratios: 'Passif : 20 / 25 / 30 / 35 / 40% Pénétration d\'Armure', iconUrl: `${CDN}/img/spell/DariusAxeGrab.png` },
      { id: 'DariusExecute', key: 'R', name: 'Guillotine noxienne', description: 'Saute sur un champion pour lui asséner un coup fatal infligeant des DÉGÂTS BRUTS massifs, augmentés de 20% par charge de Plaie béante (jusqu\'à +100%). S\'il achève la cible, le sort peut être relancé gratuitement pendant 20s (au rang 3, le CD est annulé définitivement).', cooldown: '120 / 100 / 80s', cost: '100 / 100 / 0 Mana', range: '460', ratios: '125/250/375 (+75% AD bonus) dégâts bruts · Max à 5 charges : 250/500/750 (+150% AD bonus)', iconUrl: `${CDN}/img/spell/DariusExecute.png` },
    ]
  },
  {
    id: 'Jax',
    key: '24',
    name: 'Jax',
    title: 'le Maître d\'armes',
    blurb: 'Inégalé en combat armé et célèbre pour son sarcasme, Jax est le dernier maître d\'armes vivant d\'Icathia.',
    roles: ['TOP', 'JUNGLE'],
    tags: ['Fighter', 'Assassin'],
    iconUrl: `${CDN}/img/champion/Jax.png`,
    splashUrl: `${IMG_CDN}/splash/Jax_0.jpg`,
    stats: { hp: 615, hpperlevel: 100, mp: 339, armor: 36, armorperlevel: 4.2, spellblock: 32, attackdamage: 68, attackdamageperlevel: 4.25, attackspeed: 0.638, movespeed: 350 },
    spells: [
      { id: 'JaxPassive', key: 'P', name: 'Assaut implacable', description: 'Les attaques de base consécutives de Jax augmentent sa vitesse d\'attaque de 3.5% à 11% par charge (cumulable 8 fois, soit jusqu\'à +88% AS).', cooldown: 'Passif continu', cost: 'Sans coût', range: 'Attaque', ratios: 'Jusqu\'à +28% à +88% Vitesse d\'Attaque', iconUrl: `${CDN}/img/passive/Armsmaster_MasterOfArms.png` },
      { id: 'JaxQ', key: 'Q', name: 'Frappe bondissante', description: 'Jax bondit vers une unité ciblée (alliée, ennemie, monstre ou balise). S\'il s\'agit d\'un ennemi, il lui inflige de lourds dégâts physiques.', cooldown: '8 / 7.5 / 7 / 6.5 / 6s', cost: '65 Mana', range: '700', ratios: '65/105/145/185/225 (+100% AD bonus, +60% AP)', iconUrl: `${CDN}/img/spell/JaxLeapStrike.png` },
      { id: 'JaxW', key: 'W', name: 'Élargissement', description: 'Charge sa lanterne d\'énergie élémentaire. La prochaine attaque ou Frappe bondissante inflige des dégâts magiques supplémentaires colossaux.', cooldown: '7 / 6 / 5 / 4 / 3s', cost: '30 Mana', range: 'Attaque (+50)', ratios: '50/85/120/155/190 (+60% AP)', iconUrl: `${CDN}/img/spell/JaxEmpowerTwo.png` },
      { id: 'JaxE', key: 'E', name: 'Contre-attaque', description: 'Jax prend une posture défensive pendant 2s, esquivant 100% des attaques de base et réduisant de 25% les dégâts des sorts de zone. À la réactivation, il inflige des dégâts magiques et étourdit tous les ennemis proches pendant 1s.', cooldown: '15 / 13.5 / 12 / 10.5 / 9s', cost: '50 / 60 / 70 / 80 / 90 Mana', range: '300 (Zone)', ratios: '55/85/115/145/175 (+70% AP, +4% PV max cible)', iconUrl: `${CDN}/img/spell/JaxCounterStrike.png` },
      { id: 'JaxR', key: 'R', name: 'Maître d\'armes', description: 'Passif : Toutes les 3 attaques consécutives, inflige des dégâts magiques bonus. Actif : Balaye sa lanterne, infligeant des dégâts magiques et gagnant de l\'Armure et de la RM selon le nombre de champions touchés.', cooldown: '100 / 90 / 80s', cost: '100 Mana', range: 'Zone (375)', ratios: 'Passif : 60/120/180 (+70% AP) · Actif : +15-45 Armure/RM (+10-25 par champion touché)', iconUrl: `${CDN}/img/spell/JaxR.png` },
    ]
  },
  {
    id: 'Malphite',
    key: '54',
    name: 'Malphite',
    title: 'l\'Éclat du monolithe',
    blurb: 'Créature massive de pierre vivante née du cœur du Monolithe d\'Ixtal.',
    roles: ['TOP', 'MID'],
    tags: ['Tank', 'Mage'],
    iconUrl: `${CDN}/img/champion/Malphite.png`,
    splashUrl: `${IMG_CDN}/splash/Malphite_0.jpg`,
    stats: { hp: 644, hpperlevel: 104, mp: 280, armor: 37, armorperlevel: 4.95, spellblock: 28, attackdamage: 62, attackdamageperlevel: 4, attackspeed: 0.736, movespeed: 335 },
    spells: [
      { id: 'MalphitePassive', key: 'P', name: 'Bouclier de granit', description: 'Malphite s\'entoure d\'un bouclier de roche absorbant jusqu\'à 10% de ses PV max. Se recharge s\'il ne subit aucun dégât pendant 10-6s.', cooldown: '10-6s hors-combat', cost: 'Sans coût', range: 'Soi-même', ratios: '10% des PV max totaux', iconUrl: `${CDN}/img/passive/Malphite_GraniteShield.png` },
      { id: 'MalphiteQ', key: 'Q', name: 'Éclat sismique', description: 'Projette un fragment de roche à travers le sol, infligeant des dégâts magiques et volant 20% à 40% de la vitesse de déplacement de la cible pendant 3s.', cooldown: '8s', cost: '70 / 75 / 80 / 85 / 90 Mana', range: '625', ratios: '70/120/170/220/270 (+60% AP)', iconUrl: `${CDN}/img/spell/SeismicShard.png` },
      { id: 'MalphiteW', key: 'W', name: 'Commotion', description: 'Passif : Augmente l\'Armure de 10% à 30% (triplé quand le bouclier passif est actif). Actif : Les attaques de base fendent le sol avec des ondes de choc dévastatrices.', cooldown: '10 / 9.5 / 9 / 8.5 / 8s', cost: '30 / 35 / 40 / 45 / 50 Mana', range: 'Attaque (+50)', ratios: '30/45/60/75/90 (+20% AP, +15% Armure totale)', iconUrl: `${CDN}/img/spell/Obduracy.png` },
      { id: 'MalphiteE', key: 'E', name: 'Choc au sol', description: 'Frappe le sol en provoquant une onde de choc qui inflige des dégâts magiques et réduit la vitesse d\'attaque des ennemis touchés de 30% à 50% pendant 3s.', cooldown: '7s', cost: '50 / 55 / 60 / 65 / 70 Mana', range: 'Zone (400)', ratios: '60/95/130/165/200 (+40% AP, +30% Armure totale)', iconUrl: `${CDN}/img/spell/Landslide.png` },
      { id: 'MalphiteR', key: 'R', name: 'Force indomptable', description: 'Charge une zone à une vitesse fulgurante et inciblable. À l\'impact, inflige d\'énormes dégâts magiques et projette TOUS les ennemis en l\'air pendant 1.5s.', cooldown: '130 / 105 / 80s', cost: '100 Mana', range: '1000 (Cercle)', ratios: '200/300/400 (+90% AP)', iconUrl: `${CDN}/img/spell/UFSlash.png` },
    ]
  },

  // MID LANERS
  {
    id: 'Yasuo',
    key: '157',
    name: 'Yasuo',
    title: 'le Disgracié',
    blurb: 'Ionien à la volonté de fer, Yasuo est un bretteur agile qui manie le vent contre ses ennemis.',
    roles: ['MID', 'TOP', 'BOTTOM'],
    tags: ['Fighter', 'Assassin'],
    iconUrl: `${CDN}/img/champion/Yasuo.png`,
    splashUrl: `${IMG_CDN}/splash/Yasuo_0.jpg`,
    stats: { hp: 590, hpperlevel: 110, mp: 100, armor: 32, armorperlevel: 4.6, spellblock: 32, attackdamage: 60, attackdamageperlevel: 3.2, attackspeed: 0.697, movespeed: 345 },
    spells: [
      { id: 'YasuoPassive', key: 'P', name: 'Voie du vagabond', description: 'Chances de coup critique doublées (convertit le surplus en AD). Se déplacer remplit sa jauge de Sérénité, déclenchant un bouclier de 100-524 PV pendant 1.5s lorsqu\'il subit des dégâts.', cooldown: 'Généré par les déplacements', cost: 'Sans coût', range: 'Soi-même', ratios: 'Critique x2 · Bouclier : 100 à 524 PV', iconUrl: `${CDN}/img/passive/Yasuo_Passive.png` },
      { id: 'YasuoQ', key: 'Q', name: 'Tempête d\'acier', description: 'Coup d\'estoc perçant considéré comme une attaque de base. Au 3e coup consécutif dans les 6s, tire une tornade qui projette tous les ennemis en l\'air pendant 0.9s. Délai réduit par la vitesse d\'attaque (jusqu\'à 1.33s).', cooldown: '4.0s (réduit à 1.33s par l\'AS)', cost: 'Sans coût', range: '450 (Estoc) / 1150 (Tornade)', ratios: '20/45/70/95/120 (+105% AD total, peut critiquer)', iconUrl: `${CDN}/img/spell/YasuoQ1Wrapper.png` },
      { id: 'YasuoW', key: 'W', name: 'Mur de vent', description: 'Crée un mur d\'air pur qui avance lentement pendant 4 secondes, bloquant 100% des projectiles ennemis (attaques de tireurs, compétences ciblées et ultimes à distance).', cooldown: '30 / 27 / 24 / 21 / 18s', cost: 'Sans coût', range: '400 (Largeur 300-500)', ratios: 'Bloque tous les projectiles', iconUrl: `${CDN}/img/spell/YasuoW.png` },
      { id: 'YasuoE', key: 'E', name: 'Cercle tranchant', description: 'Se rue à travers l\'ennemi ciblé en lui infligeant des dégâts magiques. Chaque utilisation consécutive augmente les dégâts du prochain E de 25% (jusqu\'à +50%). Ne peut pas cibler la même unité pendant quelques secondes.', cooldown: '0.5 / 0.4 / 0.3 / 0.2 / 0.1s', cost: 'Sans coût', range: '475', ratios: '60/70/80/90/100 (+20% AD bonus, +60% AP)', iconUrl: `${CDN}/img/spell/YasuoE.png` },
      { id: 'YasuoR', key: 'R', name: 'Dernier soupir', description: 'Se téléporte instantanément sur un champion ennemi projeté en l\'air, le maintenant en suspension avec tous les ennemis aéroportés proches pendant 1.5s supplémentaire. Confère 50% de pénétration d\'armure BONUS pendant 15s.', cooldown: '80 / 55 / 30s', cost: 'Sans coût', range: '1400', ratios: '200/350/500 (+150% AD bonus) · +50% Pénétration d\'Armure bonus', iconUrl: `${CDN}/img/spell/YasuoR.png` },
    ]
  },
  {
    id: 'Ahri',
    key: '103',
    name: 'Ahri',
    title: 'le Renard à neuf queues',
    blurb: 'Vasteya connectée à la magie spirituelle d\'Ionia, Ahri manipule les émotions de ses proies.',
    roles: ['MID'],
    tags: ['Mage', 'Assassin'],
    iconUrl: `${CDN}/img/champion/Ahri.png`,
    splashUrl: `${IMG_CDN}/splash/Ahri_0.jpg`,
    stats: { hp: 590, hpperlevel: 104, mp: 418, armor: 21, armorperlevel: 4.7, spellblock: 30, attackdamage: 53, attackdamageperlevel: 3, attackspeed: 0.668, movespeed: 330 },
    spells: [
      { id: 'AhriPassive', key: 'P', name: 'Vol essentiel', description: 'Tuer 9 sbires ou monstres soigne Ahri de 35-95 (+17% AP). Éliminer un champion ennemi absorbe son essence pour la soigner immédiatement de 75-165 (+30% AP).', cooldown: 'Passif permanent', cost: 'Sans coût', range: 'Soi-même', ratios: 'Soin champions : 75-165 (+30% AP)', iconUrl: `${CDN}/img/passive/Ahri_SoulEater2.png` },
      { id: 'AhriQ', key: 'Q', name: 'Orbe d\'illusion', description: 'Lance son orbe spirituel qui inflige des dégâts magiques à l\'aller, puis revient en infligeant des DÉGÂTS BRUTS purs au retour.', cooldown: '7s', cost: '60 / 70 / 80 / 90 / 100 Mana', range: '900', ratios: 'Aller : 40-140 (+50% AP) magique · Retour : 40-140 (+50% AP) brut', iconUrl: `${CDN}/img/spell/AhriOrbofDeception.png` },
      { id: 'AhriW', key: 'W', name: 'Lucioles', description: 'Libère trois lucioles qui ciblent les ennemis proches (priorité aux champions charmés) et octroie un boost de vitesse de déplacement de 40% pendant 2s.', cooldown: '9 / 8 / 7 / 6 / 5s', cost: '30 Mana', range: '725', ratios: '45/70/95/120/145 (+30% AP)', iconUrl: `${CDN}/img/spell/AhriFoxFire.png` },
      { id: 'AhriE', key: 'E', name: 'Charme', description: 'Envoie un baiser qui charme le premier ennemi touché pendant 1.4-2s, interrompant ses déplacements, le rendant inoffensif et l\'attirant vers Ahri.', cooldown: '12s', cost: '60 Mana', range: '1000', ratios: '80/120/160/200/240 (+60% AP)', iconUrl: `${CDN}/img/spell/AhriSeduce.png` },
      { id: 'AhriR', key: 'R', name: 'Assaut spirituel', description: 'Se rue dans la direction ciblée en tirant des traits d\'essence sur 3 ennemis proches. Peut être lancé jusqu\'à 3 fois en 15s. Tuer un champion confère une charge supplémentaire et prolonge la durée de 10s.', cooldown: '130 / 105 / 80s', cost: '100 Mana', range: '600 (Ruée)', ratios: '60/90/120 (+35% AP) par trait · Jusqu\'à 3-5 ruées', iconUrl: `${CDN}/img/spell/AhriTumble.png` },
    ]
  },

  // ADC / BOTTOM
  {
    id: 'Jinx',
    key: '222',
    name: 'Jinx',
    title: 'la Gâchette folle',
    blurb: 'Criminelle impulsive de Zaun adorant semer le chaos avec son arsenal délirant : Poiscaille et Bang-Bang.',
    roles: ['BOTTOM'],
    tags: ['Marksman'],
    iconUrl: `${CDN}/img/champion/Jinx.png`,
    splashUrl: `${IMG_CDN}/splash/Jinx_0.jpg`,
    stats: { hp: 630, hpperlevel: 105, mp: 245, armor: 26, armorperlevel: 4.7, spellblock: 30, attackdamage: 59, attackdamageperlevel: 3.15, attackspeed: 0.625, movespeed: 325 },
    spells: [
      { id: 'JinxPassive', key: 'P', name: 'Enthousiasme !', description: 'Participer à la destruction d\'une tour, monstre épique ou champion ennemi confère 175% de vitesse de déplacement décroissante et 25% de vitesse d\'attaque totale qui peut dépasser la limite de 2.5.', cooldown: 'Passif permanent', cost: 'Sans coût', range: 'Soi-même', ratios: '+175% Vitesse de Déplacement, +25% AS illimitée', iconUrl: `${CDN}/img/passive/Jinx_Passive.png` },
      { id: 'JinxQ', key: 'Q', name: 'Flip flap !', description: 'Bascule entre Bang-Bang (le minigun qui cumule jusqu\'à +130% de vitesse d\'attaque) et Poiscaille (le lance-roquettes qui draine du mana mais gagne +100-200 de portée et inflige des dégâts de zone critiques à 110%).', cooldown: '0.9s', cost: '20 Mana par roquette', range: '525 (Minigun) / 625-725 (Roquettes)', ratios: 'Roquettes : 110% AD total en zone de critique', iconUrl: `${CDN}/img/spell/JinxQ.png` },
      { id: 'JinxW', key: 'W', name: 'Zap !', description: 'Tire un rayon électrique qui révèle et ralentit le premier ennemi touché de 30% à 70% pendant 2s tout en lui infligeant de lourds dégâts physiques.', cooldown: '8 / 7 / 6 / 5 / 4s (réduit par l\'AS)', cost: '50 / 60 / 70 / 80 / 90 Mana', range: '1500', ratios: '10/60/110/160/210 (+160% AD total)', iconUrl: `${CDN}/img/spell/JinxW.png` },
      { id: 'JinxE', key: 'E', name: 'Pyromâcheurs !', description: 'Lance 3 grenades pièges qui s\'arment en 0.7s. Les ennemis marchant dessus sont immobilisés pendant 1.5s et subissent des dégâts magiques.', cooldown: '24 / 20.5 / 17 / 13.5 / 10s', cost: '90 Mana', range: '925', ratios: '70/120/170/220/270 (+100% AP)', iconUrl: `${CDN}/img/spell/JinxE.png` },
      { id: 'JinxR', key: 'R', name: 'Super roquette de la mort !', description: 'Tire une méga-roquette globale qui traverse toute la carte en accélérant. Explose au premier champion touché, infligeant des dégâts massifs augmentés selon les PV manquants des cibles.', cooldown: '85 / 65 / 45s', cost: '100 Mana', range: 'Globale (25000)', ratios: '300/450/600 (+150% AD bonus, +25/30/35% PV manquants)', iconUrl: `${CDN}/img/spell/JinxR.png` },
    ]
  },
  {
    id: 'Kaisa',
    key: '145',
    name: "Kai'Sa",
    title: 'la Fille du Néant',
    blurb: 'Revêtue d\'une seconde peau vivante du Néant, Kai\'Sa traque sans relâche les monstres des profondeurs.',
    roles: ['BOTTOM', 'MID'],
    tags: ['Marksman', 'Assassin'],
    iconUrl: `${CDN}/img/champion/Kaisa.png`,
    splashUrl: `${IMG_CDN}/splash/Kaisa_0.jpg`,
    stats: { hp: 640, hpperlevel: 102, mp: 345, armor: 27, armorperlevel: 4.2, spellblock: 30, attackdamage: 59, attackdamageperlevel: 2.6, attackspeed: 0.658, movespeed: 335 },
    spells: [
      { id: 'KaisaPassive', key: 'P', name: 'Seconde peau', description: 'Les attaques et les immobilisations alliées appliquent du Plasma. À 4 charges, la 5e attaque fait exploser le Plasma pour 15% (+6% par 100 AP) des PV manquants de la cible. Évolution vivante : Améliore ses sorts quand elle atteint 100 AD, 100 AP ou 100% AS.', cooldown: 'Passif permanent', cost: 'Sans coût', range: 'Attaque', ratios: 'Rupture : 15% (+6% par 100 AP) des PV manquants', iconUrl: `${CDN}/img/passive/Kaisa_Passive.png` },
      { id: 'KaisaQ', key: 'Q', name: 'Pluie d\'Icathia', description: 'Tire 6 missiles se répartissant sur les ennemis proches. Évolution (100 AD) : Tire 12 missiles au lieu de 6, doublant le burst.', cooldown: '10 / 9 / 8 / 7 / 6s', cost: '55 Mana', range: '600', ratios: '40/55/70/85/100 (+50% AD bonus, +30% AP) par missile', iconUrl: `${CDN}/img/spell/KaisaQ.png` },
      { id: 'KaisaW', key: 'W', name: 'Rayon du Néant', description: 'Tire un faisceau longue portée qui applique 2 charges de Plasma. Évolution (100 AP) : Applique 3 charges et rembourse 75% du CD si un champion est touché.', cooldown: '22 / 20 / 18 / 16 / 14s', cost: '55 / 60 / 65 / 70 / 75 Mana', range: '3000', ratios: '30/55/80/105/130 (+130% AD total, +120% AP)', iconUrl: `${CDN}/img/spell/KaisaW.png` },
      { id: 'KaisaE', key: 'E', name: 'Surpresseur', description: 'Se charge pendant 1.2-0.6s en gagnant de la vitesse de déplacement, puis gagne jusqu\'à +80% de vitesse d\'attaque. Évolution (100% AS) : Devient invisible (camouflage) pendant la charge.', cooldown: '16 / 14.5 / 13 / 11.5 / 10s', cost: '30 Mana', range: 'Soi-même', ratios: '+40/50/60/70/80% Vitesse d\'Attaque · Invisibilité 0.5s', iconUrl: `${CDN}/img/spell/KaisaE.png` },
      { id: 'KaisaR', key: 'R', name: 'Instinct meurtrier', description: 'Fonce à une vitesse fulgurante sur un champion ennemi marqué par le Plasma et gagne instantanément un bouclier colossal de 75-175 (+100-200% AD, +120% AP) pendant 2s.', cooldown: '130 / 100 / 70s', cost: '100 Mana', range: '1500 / 2250 / 3000', ratios: 'Bouclier : 75/125/175 (+100/150/200% AD, +120% AP)', iconUrl: `${CDN}/img/spell/KaisaR.png` },
    ]
  },

  // SUPPORT
  {
    id: 'Thresh',
    key: '412',
    name: 'Thresh',
    title: 'le Garde aux chaînes',
    blurb: 'Spectre sadique des Îles obscures qui capture les âmes des vivants dans sa lanterne maudite.',
    roles: ['SUPPORT'],
    tags: ['Support', 'Tank'],
    iconUrl: `${CDN}/img/champion/Thresh.png`,
    splashUrl: `${IMG_CDN}/splash/Thresh_0.jpg`,
    stats: { hp: 600, hpperlevel: 120, mp: 350, armor: 28, armorperlevel: 0, spellblock: 30, attackdamage: 56, attackdamageperlevel: 2.2, attackspeed: 0.625, movespeed: 335 },
    spells: [
      { id: 'ThreshPassive', key: 'P', name: 'Damnation', description: 'Thresh ne gagne pas d\'armure par niveau. À la place, il récolte les âmes des ennemis morts à proximité, gagnant +1 Armure et +1 Puissance magique par âme absorbée.', cooldown: 'Passif permanent', cost: 'Sans coût', range: '1900 (Récolte)', ratios: '+1 Armure et +1 AP par âme infinie', iconUrl: `${CDN}/img/passive/Thresh_Passive.png` },
      { id: 'ThreshQ', key: 'Q', name: 'Peine capitale', description: 'Lance sa faux qui harponne le premier ennemi, l\'étourdit et le tracte par à-coups pendant 1.5s. Réactivation : Thresh se propulse directement vers la cible. Réduit le CD de 3s si réussi.', cooldown: '19 / 16.5 / 14 / 11.5 / 9s', cost: '70 Mana', range: '1100', ratios: '100/150/200/250/300 (+90% AP)', iconUrl: `${CDN}/img/spell/ThreshQ.png` },
      { id: 'ThreshW', key: 'W', name: 'Lien des ténèbres', description: 'Lance sa lanterne spectrale. Confère un bouclier aux alliés proches. Un allié peut cliquer sur la lanterne pour foncer instantanément vers Thresh.', cooldown: '21 / 20 / 19 / 18 / 17s', cost: '50 / 55 / 60 / 65 / 70 Mana', range: '950', ratios: 'Bouclier : 50/75/100/125/150 (+2 par âme)', iconUrl: `${CDN}/img/spell/ThreshW.png` },
      { id: 'ThreshE', key: 'E', name: 'Fauchage', description: 'Passif : Ses attaques de base se chargent hors-combat pour infliger jusqu\'à +200% AD en dégâts magiques. Actif : Balaye sa chaîne pour déplacer et ralentir tous les ennemis dans la direction voulue.', cooldown: '13 / 12 / 11 / 10 / 9s', cost: '60 / 65 / 70 / 75 / 80 Mana', range: '500', ratios: 'Actif : 75/115/155/195/235 (+70% AP) · Ralentissement : 20-40%', iconUrl: `${CDN}/img/spell/ThreshE.png` },
      { id: 'ThreshR', key: 'R', name: 'La Boîte', description: 'Crée une prison pentagonale de murs spectraux. Le premier mur brisé par un champion ennemi lui inflige de lourds dégâts magiques et le ralentit de 99% pendant 2s.', cooldown: '140 / 120 / 100s', cost: '100 Mana', range: '450 (Cercle)', ratios: '250/400/550 (+100% AP) · Ralentissement : 99%', iconUrl: `${CDN}/img/spell/ThreshR.png` },
    ]
  },
  {
    id: 'Nautilus',
    key: '111',
    name: 'Nautilus',
    title: 'le Titan des profondeurs',
    blurb: 'Légende des fonds marins de Bilgewater, Nautilus s\'assure que le tribut des profondeurs soit payé.',
    roles: ['SUPPORT', 'TOP'],
    tags: ['Tank', 'Support'],
    iconUrl: `${CDN}/img/champion/Nautilus.png`,
    splashUrl: `${IMG_CDN}/splash/Nautilus_0.jpg`,
    stats: { hp: 646, hpperlevel: 100, mp: 400, armor: 39, armorperlevel: 4.95, spellblock: 32, attackdamage: 61, attackdamageperlevel: 3.3, attackspeed: 0.706, movespeed: 335 },
    spells: [
      { id: 'NautilusPassive', key: 'P', name: 'Coup écrasant', description: 'La première attaque contre une cible inflige des dégâts physiques supplémentaires et immobilise la cible pendant 0.75-1.5s.', cooldown: '6s par cible', cost: 'Sans coût', range: 'Attaque', ratios: '14-116 dégâts physiques · Immobilisation 0.75 à 1.5s', iconUrl: `${CDN}/img/passive/Nautilus_StaggeringBlow.png` },
      { id: 'NautilusQ', key: 'Q', name: 'Coup de l\'ancre', description: 'Lance son ancre colossale. Si elle touche un ennemi, ils sont tractés l\'un vers l\'autre en infligeant des dégâts magiques. Si elle heurte un décor, Nautilus s\'y hisse et récupère 50% du CD et du mana.', cooldown: '14 / 13 / 12 / 11 / 10s', cost: '60 Mana', range: '1150', ratios: '70/115/160/205/250 (+90% AP)', iconUrl: `${CDN}/img/spell/NautilusAnchorDrag.png` },
      { id: 'NautilusW', key: 'W', name: 'Colère du titan', description: 'S\'enveloppe d\'un épais bouclier marin absorbant les dégâts. Tant que le bouclier persiste, ses attaques de base brûlent la cible et les ennemis proches avec des dégâts magiques continus.', cooldown: '12s', cost: '60 Mana', range: 'Soi-même', ratios: 'Bouclier : 50/60/70/80/90 (+8/9/10/11/12% PV max)', iconUrl: `${CDN}/img/spell/NautilusPiercingGaze.png` },
      { id: 'NautilusE', key: 'E', name: 'Répliques', description: 'Frappe violemment le sol, déclenchant 3 explosions en vagues concentriques qui infligent des dégâts magiques et ralentissent les ennemis de 30% à 50%.', cooldown: '7 / 6.5 / 6 / 5.5 / 5s', cost: '50 / 60 / 70 / 80 / 90 Mana', range: '600 (Zone)', ratios: '55/85/115/145/175 (+50% AP)', iconUrl: `${CDN}/img/spell/NautilusSplashZone.png` },
      { id: 'NautilusR', key: 'R', name: 'Grenade sous-marine', description: 'Tire une onde de choc sous-marine ciblée qui poursuit le champion ennemi. Projette et étourdit tous les ennemis traversés, puis fait exploser la cible principale dans les airs.', cooldown: '120 / 100 / 80s', cost: '100 Mana', range: '825', ratios: '150/275/400 (+80% AP) · Étourdissement 1 à 1.75s', iconUrl: `${CDN}/img/spell/NautilusGrandLine.png` },
    ]
  }
];
