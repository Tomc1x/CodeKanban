---
id: '007'
status: validated
priority: moyenne
estimate: ''
order: 10
wi: WI-20260813-MAIN-003
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:44:09.892Z'
updated: '2026-08-13T15:47:23.251Z'
validated_at: '2026-08-13T15:47:23.251Z'
---
# Cartes

## Description
Sept correctifs/ajouts sur `CardModal.tsx`, `CardItem.tsx`, `electron/lib/cardFile.cjs` et le
format de carte (frontmatter).

1. **Nom de fichier = titre de la carte.** Au blur du champ titre (pas à chaque frappe), en plus
   de sauvegarder `card.title`, renommer le fichier `.md` sur disque avec un slug du nouveau
   titre (ex. `007-affiner-les-cartes.md`), en gardant le préfixe numérique `id-`. À la
   création d'une carte (aujourd'hui `xxx-nouvelle-tache.md`), utiliser directement le titre
   par défaut donné à la création plutôt que "nouvelle-tache" si un titre est saisi avant la
   première sauvegarde. Gérer les collisions de nom (suffixe `-2`, `-3`…) et mettre à jour
   `card.filename` côté renderer après renommage (le watcher `.taskboard/` doit suivre).

2. **Priorité modifiable.** Remplacer le `<span className={PRIORITY_CLASS[card.priority]}>` en
   haut à droite du modal (actuellement lecture seule) par un `<select>`/dropdown des 3 valeurs
   (`haute`, `moyenne`, `basse`), stylé comme un tag, qui appelle `onChange({ ...card, priority
   })` à la sélection.

3. **Commentaires en discussion à droite.** Réorganiser `CardModal.tsx` en deux colonnes sur
   desktop : à gauche les champs actuels (titre, description, skills, checklist), à droite le
   fil de `## Commentaires` façon chat (bulles alignées par auteur) avec le champ « Laisser une
   note pour l'IA » fixé en bas de cette colonne comme un input de discussion. Le layout reste
   en une seule colonne empilée sous une largeur de repli (ex. `<720px`).

4. **ID copiable.** Le `#{card.id}` en haut à gauche devient cliquable : au clic, copie l'id
   dans le presse-papiers (`window.api.copyToClipboard`, déjà exposé) et affiche une micro
   animation de confirmation à côté (ex. icône qui passe en check pendant ~1,2s puis revient).

5. **Switch AskUserQuestions par carte.** Nouveau champ frontmatter `ask_user_questions:
   true | false | null` (`null`/absent = suit le réglage par défaut du projet, voir carte 008).
   Un switch dans `CardModal.tsx` force `true`/`false` sur cette carte précise, en surchargeant
   le défaut projet. Ce champ documente, pour l'IA qui traite la carte plus tard, si elle est
   autorisée à interrompre l'exécution du prompt (Description) ou le traitement d'un nouveau
   commentaire pour poser des questions de clarification (`AskUserQuestion`) avant d'agir.
   Le réglage par défaut au niveau projet est traité dans la carte 008 (page Configuration).

6. **Icône « prompt affiné ».** Nouveau champ frontmatter `refined: true | false` (défaut
   `false`). La pose de `refined: true` au moment de l'affinage est gérée séparément côté
   `skill/codekanban/SKILL.md` (mis à jour par l'utilisateur, hors périmètre de cette carte) :
   ici, il s'agit uniquement de lire/afficher ce champ côté app, et de le remettre à `false`
   automatiquement dès que la Description est modifiée manuellement dans `CardModal.tsx` (par
   l'utilisateur, via le textarea) après coup. Afficher une icône Lucide `Sparkles` quand
   `refined === true` : à côté du titre dans `CardModal.tsx`, et sur la carte dans
   `CardItem.tsx` (liste des colonnes). Ajouter `refined: boolean` au type `Card`
   (`src/types.ts`) et au parsing dans `electron/lib/cardFile.cjs`.

7. **Fermeture au clavier.** Ajouter un listener `keydown` (Échap) sur le modal ouvert qui
   appelle `onClose()`, cohérent avec la fermeture déjà en place au clic sur le backdrop.

## Checklist
- [x] Renommage du fichier `.md` au blur du titre (+ à la création avec le titre initial)
- [x] Dropdown de priorité éditable dans le modal
- [x] Commentaires en colonne « discussion » à droite du modal
- [x] ID copiable avec animation de confirmation
- [x] Champ `ask_user_questions` + switch par carte (surcharge du défaut projet, carte 008)
- [x] Champ `refined` (type + parsing) + icône Lucide `Sparkles` (modal + liste), remis à `false` si description modifiée dans l'app
- [x] Fermeture du modal avec la touche Échap
- [x] Ajouter un bouton "valider" lorsque la carte est dans la liste terminer.
- [x] Ajouter un bouton "Relancer" lorsque la carte est dans la liste terminer apres avoir ajouter un commentaire

## Commentaires
**Assistant IA** — 2026-08-13 15:55
Neuf points traités.
1. Nouveau IPC `cards:rename` (`electron/ipc/cards.cjs`, exposé via `preload.cjs` en
   `renameCard`) : slugifie le nouveau titre en gardant le préfixe `id-`, gère les collisions
   (`-2`, `-3`…), réécrit le fichier puis supprime l'ancien. `CardModal.tsx` l'appelle au blur du
   titre (nouvelle prop `onRename`) au lieu de `onChange` ; `BoardScreen.tsx` recharge les cartes
   et garde la carte ouverte sur le nouveau `filename`. La création garde `xxx-nouvelle-tache.md`
   au départ (titre par défaut identique), le premier renommage se fait donc dès le premier blur
   du titre.
2. Le tag priorité en haut à droite du modal est devenu un `<select>` (mêmes classes `tag`),
   `onChange` direct à la sélection.
3. `CardModal.tsx` réorganisé en deux colonnes via `.card-modal-cols/.card-modal-left/.card-modal-right`
   (nouvelles classes CSS, `@media (max-width:720px)` repasse en une colonne) : commentaires en
   bulles alignées par auteur à droite, scroll indépendant, saisie de note fixée en bas de cette
   colonne. Largeur du modal portée à 900px.
4. `#id` devient un bouton : copie via `window.api.copyToClipboard`, affiche « Copié ! » +
   `CheckIcon` pendant 1,5s (état local + timeout nettoyé au démontage).
5. Nouveau champ `ask_user_questions` (type `Card.askUserQuestions: boolean | null`, parsing/
   sérialisation dans `cardFile.cjs`). Implémenté en `<select>` tri-état (Suit le projet /
   Autoriser / Interdire) plutôt qu'un switch binaire pur, pour représenter correctement le
   `null` = pas de surcharge — un switch on/off ne peut pas porter cet état neutre. Documenté
   dans `skill/codekanban/SKILL.md` (nouvelle puce dans `## Règles de lecture`).
6. Nouveau champ `refined` (type + parsing/sérialisation). Icône `Sparkles` affichée à côté du
   titre dans `CardModal.tsx` et `CardItem.tsx` quand `true`. Remis à `false` automatiquement
   dans le même `onChange` que la sauvegarde de la description au blur, si le texte a changé.
7. Listener `keydown` (Échap) sur `window`, nettoyé au démontage/changement de `onClose`.
8-9. Ajoutés dans `CardItem.tsx`, visibles uniquement dans la colonne « Terminé » : bouton
   « Valider » (réutilise `onToggleCheck`, done→validated) toujours visible ; bouton « Relancer »
   (nouveau `onRelaunch`, remet la carte en `todo`) affiché seulement si le **dernier**
   commentaire de la carte est de vous (signe qu'une correction attend une reprise) — hypothèse
   posée pour interpréter « après avoir ajouté un commentaire », à ajuster si ce n'est pas le
   comportement voulu.

`tsc --noEmit` et les tests (17/17, `CardModal.test.tsx` mis à jour pour `onRename`) passent.
Point d'attention : `electron/preload.cjs` a été modifié dans cette carte (et la 008) — un
redémarrage complet de l'app (pas juste un rechargement) est nécessaire pour que `renameCard`
soit disponible.

**Vous** — 13/08 10:40
Agrandir le modal pour plus de place de l'espace commentaire

**Vous** — 13/08 10:41
Les boutons valider et relancer doivent également etre disponible dans le modal.

**Assistant IA** — 2026-08-13 15:58
Deux correctifs. Modal agrandi : `maxWidth` 900 → 1200px, `width` 92% → 95%, `maxHeight` 86vh →
92vh, et répartition des colonnes rééquilibrée à 50/50 (`.card-modal-left`/`.card-modal-right`,
`min-width` de la colonne commentaires 260 → 320px) pour donner plus de place au fil de
discussion. Boutons « Valider » et « Relancer » ajoutés dans la barre d'actions du modal
(`dialog-actions`), avec les mêmes conditions d'affichage que dans la liste : « Valider »
visible quand `card.status === 'done'`, « Relancer » visible en plus quand le dernier commentaire
est de vous. Les deux appellent directement `onChange({ ...card, status: … })` (pas besoin de
nouvelle prop, le statut `validated`/`todo` est géré comme pour tout changement de carte).
`tsc --noEmit` et les tests (17/17) passent.

**Vous** — 13/08 10:46
Le bouton relancer, doit se placer a coter du bouton "ajouter le commentaire". Le bouton valider doit etre orange de la couleur primaire de l'app. La partie commentaire doit etre scrollable pour que l'on voit toujours la partie gauche.

**Vous** — 13/08 10:xx
actuellement quand j'ouvre une carte cette derniere reste blanche, change le modal en page complete avec un bouton retour ou le retour native de la souris.

**Assistant IA** — 2026-08-13 16:10
Deux gros changements.

**Modal → page complète.** `CardModal.tsx` renommé `CardPage.tsx` (composant + test), ne rend
plus de `.dialog-backdrop`/`.dialog` mais un conteneur `.card-page` (nouvelles classes CSS
`.card-page/.card-page-cols/.card-page-left/.card-page-right`, même principe deux-colonnes
qu'avant). `BoardScreen.tsx` affiche soit le tableau, soit `CardPage`, jamais les deux en même
temps. Bouton « ← Retour » ajouté en haut à gauche de la page. Navigation : ouvrir une carte
appelle désormais `window.history.pushState(...)` (nouvelle fonction `openCardPage`) ; un
listener `popstate` global ferme la page carte. Le bouton Retour et la fermeture par Échap
appellent `window.history.back()` plutôt que de fermer directement — Chromium (Electron) déclenche
nativement `popstate` sur le geste retour de la souris (bouton arrière) et sur Alt+Gauche, donc
les deux marchent sans code Electron supplémentaire. Cause probable de la page blanche
précédente : à vérifier si le problème persistait après redémarrage de l'app (nécessaire suite
aux changements de `preload.cjs` des rapports précédents) — la réécriture en page complète
règle le point de toute façon.

**Repositionnement des boutons.** « Relancer » déplacé à côté d'« Ajouter le commentaire » (en
bas de la colonne commentaires) au lieu de la barre d'actions du bas. « Valider » passé en
`btn-primary` (couleur accent `#d97757`, orange). Zone de commentaires : `minHeight: 0` ajouté
sur le conteneur scrollable (manquait pour que `overflow-y: auto` s'applique correctement dans
un parent flex) — la colonne de gauche reste visible, seule la liste de commentaires défile.

`tsc --noEmit` et les tests (17/17, migrés vers `CardPage.test.tsx`) passent.

**Vous** — 13/08 10:51
Concernant les cartes on vient de changer pour que la carte s'ouvre en tant que page au lieu de modal pour des soucis de place. Cependant on a un empilement de barre de navigation. Ce que l'on va faire c'est premierement le titre de la carte sera dans la barre de navigation. La barre de navigation doit également avoir le bouton retour a la place de retour a la liste de projet. En réalité , la barre de navigation doit etre la meme partout. On change juste certaines informations. Le bouton fermer doit se mettre en bas a droite. de la page aussi.

**Assistant IA** — 2026-08-13 16:35
Restructuration : une seule barre de navigation, plus d'empilement.

Auparavant `App.tsx` rendait un `<Nav>` (projet + `ProjectSwitcher`) **autour de** `BoardScreen`,
qui lui-même faisait s'ouvrir `CardPage` avec son propre en-tête (bouton retour, id, titre) —
d'où les deux barres empilées. Maintenant `App.tsx` ne rend plus de `<Nav>` pour l'écran
`board` : c'est `BoardScreen.tsx` qui rend son propre `<Nav>` (le même composant partagé
`Nav.tsx`, inchangé — « la même partout ») et bascule son contenu selon qu'une carte est
ouverte ou non :
- **Pas de carte ouverte** : lien « ← Projets » à gauche, `ProjectSwitcher` à droite (comme
  avant).
- **Carte ouverte** : bouton « ← Retour » (`window.history.back()`) à la place du lien Projets,
  suivi de l'id copiable, de l'icône ✨ si `refined`, et du champ de titre éditable (même
  logique de renommage au blur qu'avant, juste déplacée de `CardPage.tsx` vers `BoardScreen.tsx`
  puisque c'est elle qui possède maintenant l'état `openCard`). Pas de `ProjectSwitcher` pendant
  qu'une carte est ouverte.

`App.tsx` passe donc à `BoardScreen` les infos nécessaires (`allProjects`, `isDark`,
`onToggleTheme`, `onBackToRoot`, `onSwitchProject`) au lieu de construire lui-même le `<Nav>`.

`CardPage.tsx` perd son en-tête (bouton retour/id/titre, déplacés dans la nav) — ne garde que le
dropdown de priorité (remonté en haut du corps de page) et les deux colonnes. Bouton « Fermer »
réintroduit en bas à droite de la barre d'actions, à côté de « Valider » (`window.history.back()`
également, cohérent avec le bouton Retour de la nav et Échap).

Tests : les deux tests de renommage de titre (`CardModal.test.tsx` à l'origine) ne
s'appliquaient plus à `CardPage` puisque le champ a déménagé — supprimés de `CardPage.test.tsx`
et remplacés par un nouveau `src/screens/BoardScreen.test.tsx` qui couvre le même scénario de
régression (pas de renommage à chaque frappe, seulement au blur) mais sur le champ de titre tel
qu'il vit désormais dans la nav de `BoardScreen`. `tsc --noEmit` et les tests (16/16 — un test
en moins net après la migration) passent. Non vérifié visuellement dans l'app (pas d'accès à un
navigateur dans cette session) : à confirmer en usage réel après redémarrage.

**Vous** — 13/08 11:08
Dans l'espace commentaire j'aimerais que l'on puisse réduire la grandeur de la réponse de l'ia. De plus, par défaut, j'aimerais que l'espace commentaire soir scroller tout en bas.

**Assistant IA** — 2026-08-13 16:45
Deux ajouts dans `CardPage.tsx`. Les commentaires de plus de 320 caractères sont maintenant
tronqués avec un bouton « Voir plus »/« Réduire » (état `expandedComments`, réinitialisé à
chaque changement de carte) — s'applique aux deux auteurs, pas seulement l'IA, mais c'est
surtout ses rapports qui dépassent le seuil en pratique. La liste de commentaires défile
automatiquement tout en bas à l'ouverture d'une carte et à chaque nouveau commentaire (`ref` sur
le conteneur, `scrollTop = scrollHeight` dans un `useEffect` sur `[card.filename,
card.comments.length]`). `tsc --noEmit` et les tests (16/16) passent.

**Vous** — 13/08 11:13
J'aimerais que lorsque l'on crée une carte, il se mette directement dans le titre pour ecrire.

**Assistant IA** — 2026-08-13 17:03
`BoardScreen.tsx` : nouvel état `focusTitleFor` posé au nom de fichier de la carte juste créée
(`onAddCard`) ; un `useEffect` sur `[openCard, focusTitleFor]` met le focus et sélectionne tout
le texte du champ titre (maintenant dans la nav, `ref` ajoutée) dès que la carte ouverte
correspond, puis réinitialise l'état. Le texte étant sélectionné, taper immédiatement remplace
« Nouvelle tâche » sans avoir à l'effacer à la main. `tsc --noEmit` et les tests (16/16) passent.

**Vous** — 13/08 11:19
Agrandis la zone de description.

**Vous** — 13/08 11:24
Et il faut que le titre soit sélectionner entierement pour que des que j'ecris, il remplace le texte déja mis. 
Lorsque l'on clique sur Entrer, on doit ajouter le commentaire ou unfocus c'est SHIFT+enter pour sauter une ligne.

**Assistant IA** — 2026-08-13 17:20
Trois correctifs dans `CardPage.tsx` / `BoardScreen.tsx` (WI-20260813-MAIN-003).

1. **Zone de description agrandie.** `rows={4}` → `rows={10}` sur le textarea de description
   (`CardPage.tsx`).
2. **Titre sélectionné entièrement au focus.** `onFocus={(e) => e.target.select()}` ajouté sur le
   champ titre de la nav (`BoardScreen.tsx`) — s'applique maintenant à chaque prise de focus (clic
   ou tabulation), pas seulement juste après la création d'une carte comme avant. Taper immédiatement
   remplace donc le titre existant à chaque fois.
3. **Entrée = ajouter le commentaire, Shift+Entrée = saut de ligne.** `onKeyDown` sur le textarea
   « Laisser une note pour l'IA » (`CardPage.tsx`) : Entrée seule empêche le saut de ligne par
   défaut et appelle `addComment()` si le brouillon n'est pas vide, sinon retire simplement le
   focus (`blur()`) ; Shift+Entrée n'est pas intercepté et insère un saut de ligne normalement.

`tsc --noEmit` et les tests (16/16) passent.

**Vous** — 13/08 11:31
Le titre n'est pas sélectionné entierement.

**Assistant IA** — 2026-08-13 17:40
Cause identifiée : un `select()` synchrone dans `onFocus` est écrasé par l'action par défaut du
`mouseup` — Chromium (Electron) recollapse la sélection au point de clic juste après le focus
quand celui-ci vient d'un clic souris (le `select()` de la création de carte fonctionnait, lui,
car il suit un `.focus()` **programmatique**, sans `mouseup` associé). Correctif dans
`BoardScreen.tsx` : le `select()` est reporté dans un `setTimeout(..., 0)` pour s'exécuter après
l'action par défaut du navigateur, au lieu d'être écrasé par elle. `tsc --noEmit` et les tests
(16/16) passent. Non vérifiable visuellement dans cette session (pas d'accès navigateur) : à
confirmer après un focus au clic dans l'app.
