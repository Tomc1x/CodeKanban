---
id: '011'
status: validated
priority: basse
estimate: ''
order: 20
wi: WI-20260813-MAIN-008
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T15:31:09.654Z'
updated: '2026-08-13T16:18:39.788Z'
validated_at: '2026-08-13T16:18:39.788Z'
---
# Tutoriel

## Description
Overlay guidé en 2 étapes, affiché automatiquement au tout premier lancement de l'application,
pour éviter d'arriver sur un écran vide sans savoir qu'il faut installer un skill IA ou ajouter un
projet.

1. **Détection premier lancement.** Flag persistant `localStorage` (ex.
   `codekanban:tutorial-seen`, même approche que les brouillons de commentaire dans
   `CardPage.tsx`) posé à `true` dès que l'overlay est fermé (bouton « Terminer », clic sur le
   fond, ou Échap). Tant que ce flag est absent, l'overlay s'affiche automatiquement au montage de
   `App.tsx`.
2. **Contenu — 2 étapes**, navigables (boutons « Suivant »/« Précédent », points de progression) :
   - Étape 1 — *Installer le skill IA* : sur l'écran « Configuration » (`InstallScreen.tsx`),
     surligne/pointe le bouton d'installation existant et explique en 1-2 phrases que ce skill
     permet à un agent IA (Claude Code, etc.) de lire/écrire les cartes de `.taskboard/`
     directement sur disque — sans lui, l'IA ne voit pas le backlog.
   - Étape 2 — *Créer un projet et une carte* : sur l'écran « Projets » (`RootScreen.tsx`),
     surligne/pointe le bouton « Ajouter un dossier racine » (un projet = un dossier local), puis
     explique qu'une fois un projet ouvert, le bouton « + » d'une colonne sert à créer sa première
     carte.
3. **Implémentation.** Composant partagé (ex. `src/components/TutorialOverlay.tsx`), monté au
   niveau `App.tsx`, en `position: fixed` par-dessus l'app (z-index élevé) : un halo/cadre CSS
   approximatif autour de la zone ciblée par l'étape courante (pas besoin de mesurer précisément
   la position au pixel près) + une bulle de texte avec la navigation.
4. **Rejouable.** Bouton « Aide » (icône `?`) ajouté dans `Nav.tsx`, visible sur les écrans
   Projets/Configuration à côté du lien Configuration, qui relance l'overlay depuis l'étape 1 à la
   demande sans toucher au flag `localStorage` (le premier-lancement automatique ne se redéclenche
   pas une fois vu, mais reste accessible manuellement).

## Checklist
- [x] Flag `localStorage` premier lancement + affichage auto de l'overlay au montage de `App.tsx`
- [x] Étape 1 : pointer/expliquer l'installation du skill IA sur l'écran Configuration
- [x] Étape 2 : pointer/expliquer l'ajout d'un dossier racine + création d'une carte sur l'écran Projets
- [x] Composant `TutorialOverlay` (halo + bulle + navigation Suivant/Précédent/Terminer, fermeture Échap/backdrop)
- [x] Bouton « Aide » dans `Nav.tsx` pour rejouer le tutoriel manuellement

## Commentaires
**Assistant IA** — 2026-08-13 18:05
Implémenté selon la spec affinée (WI-20260813-MAIN-006).

1. **Flag `localStorage`.** `codekanban:tutorial-seen` posé dans `App.tsx` à la fermeture
   (`finishTutorial`) ; au montage, un `useEffect([])` lance `startTutorial()` si le flag est
   absent.
2. **Contenu 2 étapes.** `TUTORIAL_STEPS` dans `App.tsx` : étape 1 pointe `[data-tutorial=
   "install-skill"]` sur `InstallScreen.tsx` (bouton d'installation), étape 2 pointe
   `[data-tutorial="add-root"]` sur `RootScreen.tsx` (bouton « Ajouter un dossier racine »), texte
   de l'étape 2 explique aussi la création de carte via le bouton « + » d'une colonne (pas de
   cible visuelle possible pour cette partie sans projet ouvert, comme anticipé dans la spec).
   `App.tsx` change l'écran affiché (`setScreen`) en même temps que l'étape du tutoriel pour que
   la cible existe dans le DOM.
3. **`TutorialOverlay.tsx`** (nouveau composant) : halo (`box-shadow: 0 0 0 9999px` sur un cadre
   positionné sur le `getBoundingClientRect()` de la cible, recalculé au `resize`) + bulle
   `.dialog` avec titre/texte/points de progression, navigation Suivant/Précédent/Terminer/Passer.
   Fermeture : touche Échap, clic sur le fond (le clic sur la bulle elle-même ne ferme pas,
   `stopPropagation`).
4. **Bouton Aide.** Icône `HelpCircle` (`HelpIcon`, nouveau dans `icons.tsx`) ajoutée dans la
   barre `Nav` des écrans Projets/Configuration, appelle `startTutorial()` sans toucher au flag
   `localStorage` — rejouable à volonté.

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session) : à confirmer en usage réel, en particulier le positionnement du
halo/bulle au changement d'écran.

**Vous** — 13/08 11:47
Fait le tutoriel des autres fonctionnalités.

**Assistant IA** — 2026-08-13 18:20
4 étapes ajoutées aux 2 existantes (installer le skill, créer un projet), après clarification :
cycle de vie d'une carte, créer/remplir une carte, dialoguer avec l'IA, réglages du projet.

- `src/App.tsx` : `ALL_TUTORIAL_STEPS` passe de 2 à 6 étapes. Les 3 nouvelles étapes sur l'écran
  Board (`requiresProject: true`) sont automatiquement sautées si l'utilisateur n'a encore aucun
  projet configuré (`allProjects.length === 0` au moment de `startTutorial`/`goToTutorialStep`) ;
  sinon le premier projet de la liste est ouvert automatiquement pour ces étapes
  (`applyTutorialStep`), conformément à ton choix.
  - Étape « Cycle de vie d'une carte » pointe `[data-tutorial="board-columns"]` (le conteneur des
    6 colonnes, nouveau sur `BoardScreen.tsx`).
  - Étape « Créer et remplir une carte » pointe `[data-tutorial="add-card"]` (bouton « + » de la
    colonne « À faire » uniquement, nouveau sur `Column.tsx`).
  - Étape « Dialoguer avec l'IA » est purement textuelle (`targetSelector: null`, pas de carte
    ouverte automatiquement) — `TutorialOverlay.tsx` gère déjà ce cas (halo désactivé, fond
    assombri, bulle centrée), le type `TutorialStep.targetSelector` est passé à `string | null`.
  - Étape « Réglages du projet » pointe `[data-tutorial="project-settings"]` (bloc réglages,
    nouveau sur `InstallScreen.tsx`).
- Les étapes filtrées sont figées dans un nouvel état `tutorialSteps` au lancement du tutoriel
  (pas recalculées à chaque étape), pour que la navigation Suivant/Précédent reste cohérente même
  si `allProjects` change en cours de route.

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session) : à confirmer en usage réel, notamment l'ouverture automatique du
premier projet aux étapes 3-5.

**Vous** — 13/08 11:58
Le tutoriel ne suis pas vraiment leurs objectif quand il y a du scroll par exemple. Est -il possible de le faire suivre le scroll ?

**Assistant IA** — 2026-08-13 18:35
Corrigé dans `TutorialOverlay.tsx` (WI-20260813-MAIN-006). Deux causes cumulées :

1. Le halo ne se recalculait qu'au montage de l'étape et au `resize` de la fenêtre — un scroll
   (page entière ou conteneur interne comme la liste de projets ou une colonne du board) ne
   redéclenchait jamais `getBoundingClientRect()`, donc le cadre restait figé à sa position
   d'origine. Ajout d'un listener `scroll` sur `window` avec `capture: true` (les événements
   `scroll` ne remontent pas par bubbling, `capture` est nécessaire pour intercepter le scroll de
   n'importe quel conteneur interne défilant), throttlé via `requestAnimationFrame` pour éviter un
   recalcul à chaque pixel défilé.
2. Si la cible était scrollée hors du champ visible au moment où l'étape s'affichait, rien ne
   l'amenait à l'écran. Ajout d'un `element.scrollIntoView({ block: 'center', behavior: 'smooth'
   })` au début de chaque étape ayant une cible — le scroll déclenché re-mesure automatiquement
   via le nouveau listener ci-dessus.

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session) : à confirmer en usage réel, notamment le comportement du
`scrollIntoView` sur les conteneurs à scroll horizontal (colonnes du board).

**Vous** — 13/08 12:04
Il n'ouvre pas la page detail d'une carte lors du tutoriel. Tu peux faire une fausse carte peux etre.

**Vous** — 13/08 12:05
Dans le tutoriel ajoute l'explication de comment utiliser claude code avec codekanban

**Assistant IA** — 2026-08-13 19:15
Deux ajouts (WI-20260813-MAIN-008), suivant exactement les pistes proposées.

1. **Fausse carte.** Nouvelle constante `TUTORIAL_DEMO_CARD` (`src/App.tsx`) : une carte factice
   avec un exemple de commentaire utilisateur/IA, jamais écrite sur disque (`onChange`/`onDelete`
   sont des no-op). L'étape « Dialoguer avec l'IA » n'ouvre plus une carte réelle (ce qui ne
   marchait pas sans carte existante) : elle affiche désormais cette carte factice en plein écran
   via un nouvel overlay dédié dans `App.tsx` (z-index 1900, sous le `TutorialOverlay` à 2000),
   avec un bandeau « Aperçu — cette carte n'est pas enregistrée » pour ne pas prêter à confusion.
   Cette étape n'a donc plus besoin d'un projet ouvert (`requiresProject` retiré) — elle fonctionne
   même si l'utilisateur n'a encore aucun projet. Cible du halo déplacée sur
   `[data-tutorial="card-comments"]`, nouvel attribut posé sur la colonne de droite dans
   `CardPage.tsx`.
2. **Utiliser Claude Code avec CodeKanban.** Nouvelle étape textuelle (sans cible), juste après
   « Installer le skill IA » : explique qu'aucune IA n'est appelée par l'app elle-même — il faut
   ouvrir un terminal dans le dossier du projet, lancer Claude Code (ou un agent compatible) et lui
   demander de traiter le backlog, qui lit `.taskboard/` directement grâce au skill.

Le tutoriel compte maintenant 7 étapes (au lieu de 6). `tsc --noEmit` et les tests (16/16)
passent. Non vérifié visuellement (pas d'accès navigateur dans cette session) : à confirmer en
usage réel, notamment le rendu de la carte factice en plein écran.

**Vous** — 13/08 12:14
Dans l'etape dialogue avec l'ia le modal est trop bas et on ne peux pas cliquer sur suivant.

**Assistant IA** — 2026-08-13 19:25
Corrigé dans `TutorialOverlay.tsx` (WI-20260813-MAIN-008). Cause : la position verticale de la
bulle utilisait une hauteur supposée fixe (`window.innerHeight - 240`) au lieu de la hauteur
réellement rendue. Sur l'étape « Dialoguer avec l'IA », la cible (`card-comments`) est une colonne
haute dont le bas touche presque le bas de l'écran, donc la bulle était clampée tout en bas — et
son contenu (texte plus long que les autres étapes) dépassait largement les 240px supposés,
poussant les boutons Suivant/Précédent hors de l'écran.

Remplacé par un positionnement basé sur la hauteur réelle de la bulle (mesurée via `ref` +
`useLayoutEffect`, recalculée à chaque étape) : elle se place sous la cible si la place
disponible suffit, sinon au-dessus, toujours clampée dans le viewport avec une marge de 16px.
Ajout d'un `maxHeight`/`overflowY: auto` de sécurité sur la bulle elle-même au cas où le contenu
dépasserait la hauteur de l'écran, pour que les boutons restent toujours accessibles en dernier
recours.

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session) : à confirmer en usage réel sur l'étape « Dialoguer avec l'IA ».
