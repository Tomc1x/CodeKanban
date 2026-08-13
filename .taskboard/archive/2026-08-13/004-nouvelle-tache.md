---
id: '004'
status: validated
priority: moyenne
estimate: ''
order: 70
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:26:49.952Z'
updated: '2026-08-13T15:45:20.089Z'
validated_at: '2026-08-13T14:27:16.313Z'
---
# Listes

## Description
Rendre chaque colonne du tableau indépendamment scrollable au lieu de faire défiler toute la
page quand une liste contient beaucoup de cartes.

Dans `src/styles/styles.css` :
- `.board-column` (ligne ~570) : remplacer/compléter `min-height: 60vh` par une hauteur
  contrainte relative à la fenêtre (ex. `height: calc(100vh - <hauteur nav + titlebar>)`),
  `display: flex; flex-direction: column` est déjà présent, pour que l'en-tête
  (`.board-column-header`) reste fixe en haut.
- `.board-cards` (ligne ~598) : ajouter `overflow-y: auto` (elle a déjà `flex: 1`) pour qu'elle
  scrolle indépendamment.

Résultat attendu : le header de chaque colonne (nom + compteur) et le bouton « Ajouter une
carte » restent visibles, seule la zone des cartes défile verticalement à l'intérieur de sa
colonne ; la page globale (`BoardScreen`) ne doit plus grandir verticalement à cause du contenu
d'une colonne.

## Checklist
- [x] `.board-column` avec hauteur contrainte à la fenêtre
- [x] `.board-cards` scrollable indépendamment (overflow-y: auto)
- [x] Vérifier que l'en-tête de colonne et le bouton « Ajouter » restent visibles pendant le scroll

## Commentaires
**Assistant IA** — 2026-08-13 14:00
`.board-column` a maintenant `height: calc(100vh - 126px)` (offset title-bar + nav + padding) au
lieu de `min-height: 60vh`. `.board-cards` a `min-height: 0; overflow-y: auto` pour scroller
indépendamment. Le bouton « Ajouter une carte » a été sorti de `.board-cards` (déplacé dans
`Column.tsx` en enfant direct de `.board-column`, après la zone de cartes) pour rester visible
en bas de colonne pendant le scroll, comme le header en haut. `tsc --noEmit` et l'ensemble des
tests (17/17) passent.

**Vous** — 13/08 09:57
Il faudrait plutot mettre un height maximum, j'aimerais que le bouton "ajouter une carte", doit etre juste en dessous des carte dans la liste.

**Assistant IA** — 2026-08-13 15:24
Corrigé : `.board-column` utilise maintenant `max-height: calc(100vh - 126px)` au lieu de
`height`. Une colonne avec peu de cartes se contente donc de sa hauteur de contenu (le bouton
« Ajouter » apparaît juste sous la dernière carte) ; une colonne qui dépasse la hauteur dispo est
clampée au max et `.board-cards` scrolle en interne, le bouton restant visible en bas. `tsc
--noEmit` et les tests (17/17) passent.

**Vous** — 13/08 10:25
Le bouton ajouter une carte est toujours en bas de la liste alors qu'il n'y a pas de carte dans la liste..

**Assistant IA** — 2026-08-13 15:27
Cause : `.board-grid` (grid) étire par défaut tous ses items (`align-items: stretch` implicite)
à la hauteur de la ligne, donc même une colonne vide était étirée à la hauteur de la colonne la
plus haute, et `.board-cards` (`flex: 1`) remplissait cet espace vide, repoussant le bouton en
bas. Ajouté `align-items: start` sur `.board-grid` : chaque colonne garde désormais sa propre
hauteur de contenu (bornée par `max-height` sur `.board-column`), le bouton colle bien sous la
dernière carte quand la liste est courte ou vide. `tsc --noEmit` et les tests (17/17) passent.
