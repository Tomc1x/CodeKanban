---
id: 009
status: validated
priority: moyenne
estimate: ''
order: 60
wi: WI-20260813-MAIN-004
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T14:06:32.675Z'
updated: '2026-08-13T15:45:20.087Z'
validated_at: '2026-08-13T15:34:23.549Z'
---
# Ordres

## Description
Deux volets : faire respecter l'ordre visuel de la colonne « À faire » par l'IA (pas l'ordre
numérique des id), et ajouter un système de dépendances entre cartes avec contrainte visuelle
au drag & drop.

1. **Ordre de traitement = ordre visuel.** Aujourd'hui rien dans `skill/codekanban/SKILL.md` ne
   précise l'ordre dans lequel traiter plusieurs cartes `todo` : il faut trier par le champ
   `order` (déjà présent en frontmatter, c'est lui qui pilote la position dans la colonne via
   `reorderColumn`), croissant, **pas** par `id`/nom de fichier. Concrètement : si la carte 005
   a un `order` inférieur à celui de la carte 004 dans la colonne « À faire » (parce qu'elle a
   été glissée au-dessus), l'IA doit traiter 005 avant 004. Ajouter une règle explicite dans
   `## Règles de lecture` du skill : « Quand plusieurs cartes sont à prendre dans `todo`,
   traite-les dans l'ordre croissant du champ `order` (l'ordre visuel de la colonne), pas dans
   l'ordre des identifiants de fichier. »

2. **Dépendances entre cartes.** Nouveau champ frontmatter `depends_on: string[]` (liste
   d'`id` de cartes du même projet). Ajout dans `CardModal.tsx` d'un sélecteur « Dépend de… »
   (liste des autres cartes du projet par `#id — titre`, sélection multiple) qui écrit ce champ.
   Contrainte : **une carte ne peut pas être positionnée, dans la colonne « À faire », avant une
   carte figurant dans son `depends_on`** (i.e. son `order` doit rester supérieur à celui de
   chacune de ses dépendances tant qu'elles sont aussi en `todo`). Pas de contrainte inter-
   colonnes dans cette carte (une dépendance peut très bien être en `doing`/`done` sans bloquer
   quoi que ce soit — seul l'ordre relatif en `todo` est contraint).

3. **Retour visuel au drag.** Dans `Column.tsx`/`BoardScreen.tsx`, pendant le drag d'une carte
   qui a des dépendances (ou pendant le drag d'une carte dont d'autres cartes dépendent) sur la
   colonne « À faire », désactiver visuellement les positions interdites : ajouter une classe
   CSS (ex. `.drop-zone-forbidden`, fond rayé rouge en diagonale via `repeating-linear-
   gradient`) sur les emplacements du calcul de `dropIndex` qui violeraient la contrainte, et
   empêcher `onDrop` d'appliquer un ordre invalide (no-op si la position visée est interdite).

## Checklist
- [x] Règle d'ordre de traitement (`order` croissant, pas `id`) ajoutée dans `SKILL.md`
- [x] Champ `depends_on` + sélecteur « Dépend de… » dans `CardModal.tsx` (devenu `CardPage.tsx`, voir carte 007)
- [x] Validation de l'ordre relatif dépendance/dépendant dans la colonne « À faire »
- [x] Zone interdite visuelle (rouge zébrée) sur les positions de drop invalides + `onDrop` bloqué

## Commentaires
**Assistant IA** — 2026-08-13 16:05
1. `skill/codekanban/SKILL.md` (`## Règles de lecture`) : nouvelle puce sur l'ordre de traitement
   par `order` croissant, plus une puce sur `depends_on` (attendre que les dépendances soient
   `done`/`validated` avant de prendre une carte).
2. Nouveau champ `Card.dependsOn: string[]` (`src/types.ts`), parsing/sérialisation `depends_on`
   dans `electron/lib/cardFile.cjs`, initialisé à `[]` dans `cards:create`. Sélecteur multiple
   « Dépend de… » ajouté dans la page carte (liste `#id — titre` de toutes les autres cartes du
   projet, nouvelle prop `allCards` passée depuis `BoardScreen.tsx`).
3. Nouvelle fonction `getDependencyBounds(draggingCard, colCards)` (`src/lib/columns.ts`) :
   calcule la plage d'index autorisée dans la colonne « À faire » (après toutes ses dépendances
   encore en `todo`, avant tous ses dépendants encore en `todo`). Utilisée à deux endroits :
   `Column.tsx` pour surligner en rouge zébré (`.drop-zone-forbidden`, nouvelle classe CSS) les
   cartes dont la position tombe hors de cette plage pendant le drag ; `BoardScreen.handleDrop`
   pour ignorer silencieusement un drop qui violerait la contrainte (pas de contrainte
   inter-colonnes, uniquement dans « À faire », comme spécifié).

`tsc --noEmit` et les tests (17/17) passent.

**Vous** — 13/08 10:53
La liste d'ordre est pas tres jolie, fait une liste adapter au style. Pour la selection du askuserquestion je m'attendais un switch on/off pas a un dropdown.

**Assistant IA** — 2026-08-13 16:40
Deux correctifs dans `CardPage.tsx` / `styles.css`.

1. **« Dépend de… ».** Le `<select multiple>` est remplacé par une liste de cases à cocher
   (`.checkbox-list`, nouvelle classe : cadre bordé, scroll interne, même style que la
   Checklist juste en dessous) — une ligne `#id — titre` par carte du projet, cochée si elle
   fait partie de `dependsOn`.
2. **AskUserQuestions en switch.** Nouveau composant visuel `.switch-track`/`.switch-thumb`
   (interrupteur plat à deux positions, cohérent avec le design system « Modernist » sans coins
   arrondis — pas un slider iOS classique). Cliquer bascule directement entre `true`/`false`.
   Le champ restant tri-état (`null` = suit le réglage projet, documenté dans `SKILL.md` et
   utilisé par la carte 008), un petit texte à côté du switch indique l'état courant et un
   bouton « Réinitialiser » n'apparaît que si la carte a une valeur explicite, pour revenir à
   `null`.

`tsc --noEmit` et les tests (16/16) passent.

**Vous** — 13/08 11:05
La liste de dépendance ne doit pas lister TOUTES les cartes mais que les cartes dans la liste ou se trouve la carte.

**Assistant IA** — 2026-08-13 17:00
`CardPage.tsx` : la liste « Dépend de… » filtre maintenant sur `c.status === card.status` en
plus d'exclure la carte elle-même — ne montre que les autres cartes de la même colonne. Cohérent
avec la contrainte elle-même, qui ne s'applique qu'à l'intérieur de la colonne « À faire ».
`tsc --noEmit` et les tests (16/16) passent.

**Vous** — 13/08 11:18
Les cartes qui sont dans les listes en cours ou teminé et validé ne doivent pas afficher la partie "dépend de".

**Assistant IA** — 2026-08-13 17:25
Correctif dans `CardPage.tsx` (WI-20260813-MAIN-004) : le bloc « Dépend de… » (titre + liste de
cases à cocher) n'est plus rendu que si `card.status === 'todo'` — masqué en `doing`, `blocked`,
`done` et `validated`. Cohérent avec la contrainte elle-même, qui ne s'applique déjà qu'à la
colonne « À faire » (carte 009, point 2). `tsc --noEmit` et les tests (16/16) passent.
