# IA Game

Ce projet met en place un système de véhicules autonomes et de particules interactives pour créer des effets visuels et des comportements de suivi complexes. Les véhicules et les particules réagissent à des cibles et à la souris, créant ainsi une expérience immersive.

## Fonctionnalités Actives

### Véhicules et Cibles

1. **Cible mobile** :

   - En mode normal (`mouseMode = false`), une cible rouge se déplace de manière autonome et réapparaît de l'autre côté de l'écran lorsqu'elle atteint les bords.
   - En mode souris (`mouseMode = true`), la cible suit la position de la souris.

2. **Véhicule Leader et Mode de Suivi** :

   - Les véhicules peuvent basculer entre deux modes de comportement :
     - **Follow** : Le véhicule ralentit à l'approche de la cible.
     - **Destroy** : Le véhicule intercepte la cible, sans ralentir à l'approche.

3. **Evitement d'Obstacles** :

   - Les véhicules détectent et évitent automatiquement les autres véhicules et les météorites, ajustant leur trajectoire en fonction de leur proximité avec les obstacles.

4. **Formation** :

   - En mode `formation`, les véhicules suivent une formation organisée en ligne derrière le leader, ajustant leur position par rapport au véhicule leader.

5. **Transporteur** :
   - Le véhicule transporteur (en vert) erre pour trouver des astronuates à la dérive (issus vaisseaux détruit). Si il détecte une astronaute (son radar devient rouge et s'accélère), il le sauve.

### Interface Utilisateur Interactive

#### LES TEXTES EN PARTICULES SONT POUR LA PLUPART DES BOUTONS ET REAGISSENT AUX CLIC POUR ACTIVER/DESACTIVER LEUR FONCTIONNALITEES RESPECTIVES.

1. **Sliders de Contrôle des Paramètres** :

   - **Max Speed** : Ajuste la vitesse maximale des véhicules.
   - **Max Force** : Ajuste la force maximale appliquée aux véhicules.

2. **Boutons d'Interactivité** :
   - **Toggle Target Mode** : Alterne entre une cible mobile (suivant la souris) et une cible autonome.
   - **Toggle Formation** : Active ou désactive le mode de formation des véhicules.
   - **Toggle Meteor Mode** : Active ou désactive l'apparition de météorites.
   - **Toggle Velocity Vector** : Affiche ou masque le vecteur de vitesse des véhicules.
   - **Switch Mode** : Bascule entre les modes `Follow` et `Destroy` pour le véhicule leader.
   - **Modes de Jeu** : Sélectionne entre les modes `Peaceful`, `Normal`, et `Hardcore`, modifiant la gravité des collisions.

### Particules et Effets Visuels

1. **Particules de Texte** :

   - Les mots du menu et le mode actuel sont formés par des particules qui réagissent à la souris et se déplacent subtilement au survol.
   - **Effet d'éparpillement** : Lors d'un clic, les particules s'éloignent momentanément de leur position, puis reviennent pour reformer le texte.

2. **Particules d'Explosion et Débris** :

   - Lorsqu'un véhicule est détruit, une explosion est animée en utilisant des particules.
   - **Débris** : Les particules de débris continuent de flotter lentement après une explosion, réagissant doucement aux véhicules proches et restant présentes jusqu'à ce qu'elles sortent de l'écran.

3. **Traînées de Véhicules** :
   - Les véhicules laissent une traînée violette progressive derrière eux, ajoutant un effet visuel de mouvement dynamique.

### Objets Interactifs

1. **Météorites** :

   - Les météorites se déplacent horizontalement de droite à gauche avec des vitesses et des rotations aléatoires, réapparaissant lorsqu'elles quittent l'écran.
   - Les véhicules détectent et évitent les météorites activement en mode `meteorMode`.

2. **Affichage de Mode Actif** :

   - Le mode de suivi actuel (`Follow` ou `Destroy`) est affiché en bas à droite de l'écran, formé par des particules réagissant aux clics et au survol.

3. **Affichage du Nombre d'astronaute secourus** :
   - Le nombre d'astronaute secourus est affiché en haut à gauche de l'écran, formé par des particules réagissant au survol.

### Effets de Bord et Gestion d'Interface

1. **Bords de l'Écran** :

   - Les météorites et la cible réapparaissent de l'autre côté de l'écran lorsqu'ils atteignent les bords.

2. **Message `Game Over`** :
   - Lorsque tous les véhicules sont détruits, les particules du menu se rassemblent pour former un message de `GAME OVER` au centre de l'écran.

## Utilisation

- **Commandes** :
  - Les sliders permettent d’ajuster les paramètres du comportement des véhicules.
  - Les boutons de bas de page déclenchent les fonctionnalités clés (modes de jeu, cible, formation, météorites, etc.).
- **Clavier** :
  - `&` : Déclenche une explosion pour le véhicule leader (à des fins de test).

### Requis Techniques

- **p5.js Library** : Cette bibliothèque est utilisée pour l'affichage graphique, la gestion de l'animation, et la création des particules.

## Structure des Fichiers Principaux

- **`sketch.js`** : Gestion principale des comportements des véhicules, de la cible, des météorites, et des explosions.
- **`vehicle.js`** : Définit la classe `Vehicle` et ses comportements (suivi, collision, formation, etc.).
- **`particle.js`** : Définit les particules utilisées pour les explosions et le texte en particules.
- **`menu.js`** : Gestion des particules de texte pour les boutons du menu et les modes actifs.

## Conclusion

Ce projet combine des éléments de programmation graphique et d’intelligence artificielle pour simuler des véhicules autonomes interactifs avec l'utilisateur. L’interface en particules, les effets d'explosion, et le comportement dynamique des véhicules offrent une expérience visuelle enrichie et réactive.

CECI EST UN RENDU PRELIMINAIRE DANS L'ATTENTE DE VOTRE RETOUR SUR UN EVENTUEL DELAIS SUPPLEMENTAIRE.

## Eventuels futurs ajouts.

- **Mineurs** : Nouveau véhicule qui trouve des météorites, les suivent et les mine afin de les détruire et en extraire des mineraies (le transporteur les recupèrerais au même titre que les astronautes).
- **Elimination des astronaute** : Si un astronaute est touché a nouveau par une météorite, il serait éliminé définitivement.
- **Son** : Musique de fond, sons pour les explosions et astraunautes détéctés.
- **Amélioration de l'architecture du code** : Le code pourrait bénéficier d'une réorganisation afin d'être plus lisible et mieux organiser. Ajout d'un Behavior Manager.
- **Système de Niveaux** : Lorsque toutes les météorites sont minées, le niveau se termine permettant de dépenser son argent dans un vaisseau-mère et faire réaparaitre les vaisseaux dont les astronautes ont été sauvé.
- **Système de Score** : Incrémentation d'un score pour chaque évènements du jeu.
- **Menu** : Menu pour lancer le jeu sous 2 modes : le mode survie avec le système de niveau, et le mode sandbox ressemblant au jeu actuel pour observer les comportement et changer les paramètres. Possibilité de relancer la partie.
