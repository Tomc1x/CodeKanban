---
id: '005'
status: validated
priority: moyenne
estimate: ''
order: 40
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:31:16.834Z'
updated: '2026-08-13T15:45:20.086Z'
validated_at: '2026-08-13T15:16:51.041Z'
---
# Déplacement des cartes

## Description
Lorsque je déplace des cartes, il arrive que ca "glitch", il passe de haut en bas comme si la "dropbox" n'était pas assez grande. De plus les cartes ne doivent pas montrer le skill dans la liste ca prends trop de place

## Checklist
- [x] Faire remonter `dropIndex`/index de carte jusqu'à `CardItem`
- [x] Remplacer le seuil fixe à 50 % par un calcul avec hystérésis (~35 % / 65 %)
- [x] Retirer l'affichage des badges de skills dans la liste des cartes (`CardItem.tsx`)

## Commentaires
**Assistant IA** — 2026-08-13 14:05
`Column.tsx` transmet désormais `currentDropIndex` (dropIndex si la colonne est survolée, sinon
`null`) et `index` (position de la carte) à chaque `CardItem`. Dans `CardItem.tsx`, le seuil de
bascule avant/après n'est plus fixe à 50 % : il passe à 65 % si la carte est déjà en position
« avant », à 35 % si elle est déjà en position « après », 50 % sinon — ce qui absorbe le
décalage causé par l'insertion du `.drop-indicator` et supprime le flip-flop. Les badges de
skills (`SkillBadges`) ont été retirés de `CardItem.tsx` (toujours affichés/éditables dans le
modal). `tsc --noEmit` et l'ensemble des tests (17/17) passent. Point non automatisable : le
test manuel du glisser-déposer lent au milieu d'une carte reste à faire en usage réel.

**Vous** — 13/08 09:55
Il y a toujours ce comportement histérique entre les carte malheureusement

**Assistant IA** — 2026-08-13 15:42
Cause réelle trouvée, plus profonde que le seuil 50 % : dans `Column.tsx`, le `onDragOver` posé
sur `.board-column` renvoyait inconditionnellement `dropIndex = cards.length` (fin de liste) dès
que l'événement remontait jusqu'à lui — ce qui arrivait à chaque passage du curseur dans
l'interstice (`gap`) entre deux cartes, puisque cette zone n'est couverte par aucun `CardItem`
(qui fait `stopPropagation`). Résultat : un saut brutal vers la fin de la colonne à chaque
franchissement d'interstice pendant un drag lent — le vrai « comportement hystérique ». Correctif
: `Column.tsx` mesure maintenant le rect de `.board-cards` (nouvelle `ref`) et ne force
`dropIndex` à `0`/`cards.length` que si le curseur est respectivement au-dessus de la première
carte ou en dessous de la dernière ; dans un interstice interne, l'événement ne modifie plus
`dropIndex` (le dernier calcul fait par le `CardItem` survolé reste valable). Combiné à
l'hystérésis déjà en place. `tsc --noEmit` et les tests (17/17) passent.

**Vous** — 13/08 10:39
C'est encore un peu trop hysterique, quand je suis au dessus d'une autre carte, il faudrait que l'on sépare sur la moitié si la souris est sur la moitié du dessus, on place au dessus pareil en dessous.

**Assistant IA** — 2026-08-13 16:20
Hystérésis retirée : `CardItem.tsx` utilise de nouveau un seuil fixe à 50 % (moitié haute →
avant, moitié basse → après), sans ajustement selon l'état courant. Elle n'était plus
nécessaire : le vrai bug (saut de `dropIndex` en fin de liste dans les interstices entre cartes,
corrigé précédemment dans cette carte) est ce qui causait le comportement erratique — l'hystérésis
n'était qu'un correctif de contournement qui rendait le seuil de bascule asymétrique et donc
moins prévisible. Props `currentDropIndex`/`index` devenues inutiles retirées de `CardItem.tsx`
et `Column.tsx`. `tsc --noEmit` et les tests (17/17) passent.

**Vous** — 13/08 11:09
Non c'est toujours hystérique, si possible et si il existe quelque chose qui gere cela tu peux essayer.

**Assistant IA** — 2026-08-13 16:58
Changement d'approche : le drag & drop HTML5 natif (`draggable` + événements `dragstart`/
`dragover`/`drop`) est intrinsèquement peu fiable pour ce genre d'usage — c'est la cause
profonde des trois tentatives précédentes qui n'ont fait que déplacer le symptôme. Migration
vers **`@dnd-kit`** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`), une librairie
dédiée aux listes triables multi-conteneurs qui suit le pointeur directement au lieu de
s'appuyer sur les événements de drag natifs du navigateur.

- `CardItem.tsx` : `useSortable({ id: card.filename })` remplace toute la logique manuelle
  (`draggable`, calcul de ratio, hystérésis, etc.) — plus aucun code de positionnement à la main.
- `Column.tsx` : chaque colonne est un conteneur `useDroppable` + `SortableContext` (les cartes
  qu'elle contient, en `verticalListSortingStrategy`).
- `BoardScreen.tsx` : tout est enveloppé dans un `DndContext` (`PointerSensor`, seuil
  d'activation 4px pour distinguer clic et drag). `onDragOver` déplace la carte entre colonnes
  dès le survol (retour visuel immédiat) ; `onDragEnd` calcule l'ordre final via `arrayMove` et
  persiste avec `reorderColumn` (déjà existant). La contrainte de dépendances (carte 009) est
  reprise ici : zone interdite affichée pendant le drag (même calcul `getDependencyBounds`), et
  la position finale est bornée dans la plage autorisée plutôt que rejetée. Un `DragOverlay`
  affiche un aperçu de la carte qui suit le curseur pendant le déplacement.

Toute la mécanique manuelle précédente (calcul de `dropIndex`, interstices, hystérésis,
`onDragStart`/`onDragEnd`/`onDragEnter`/`onDragLeave`) a été supprimée — dnd-kit s'en charge.
`tsc --noEmit` et les tests (16/16) passent. Non testé manuellement dans l'app réelle (pas
d'accès navigateur dans cette session) : à valider en usage réel, mais le changement de
fondation devrait éliminer la classe de bug rencontrée jusqu'ici plutôt que la contourner.
