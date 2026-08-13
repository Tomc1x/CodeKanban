---
id: '002'
status: validated
priority: moyenne
estimate: ''
order: 20
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:02:07.670Z'
updated: '2026-08-13T15:45:20.084Z'
validated_at: '2026-08-13T15:13:23.412Z'
---
# Barre de navigation

## Description
Retravailler la barre de navigation (`src/components/Nav.tsx`, `src/App.tsx`, styles `.nav*`
dans `src/styles/styles.css`) :

1. Retirer le logo (`nav-brand` / `nav-logo`, images `logo-large-light.png` /
   `logo-large-dark.png`) de la barre de navigation.
2. Le lien retour « ← Projets » (actuellement rendu via `onBrandClick` sur le logo ET comme
   lien enfant dans `App.tsx`) doit devenir un lien classique au même niveau visuel que
   « Tableau » et « Installation » (même style `.nav a`), sans traitement spécial de type
   logo/marque.
3. Déplacer l'onglet « Installation » : au lieu d'être accessible uniquement depuis un projet
   ouvert (`screen === 'install'` dans `App.tsx`, à côté de `BoardScreen`), il doit être
   accessible depuis l'écran de liste des projets (`RootScreen.tsx`) — par exemple un
   lien/bouton sur cette page qui bascule vers `InstallScreen` sans qu'un projet soit
   sélectionné. Adapter `App.tsx` (type `Screen`, gestion de `project` qui peut être `null` sur
   l'écran install) en conséquence.
4. Rendre la barre `.nav` sticky (`position: sticky; top: 0; z-index: ...`) dans
   `src/styles/styles.css` pour qu'elle reste visible pendant le scroll du tableau ou de la
   liste de projets.

## Checklist
- [x] Retirer le logo de la nav
- [x] Lien « ← Projets » au même niveau visuel que les autres liens
- [x] Déplacer l'onglet Installation vers l'écran liste de projets
- [x] Nav sticky en haut de page

## Commentaires
**Assistant IA** — 2026-08-13 13:45
Logo retiré de `Nav.tsx` (plus de `nav-brand`/`nav-logo`, imports supprimés). « ← Projets » est
maintenant un lien `<a>` classique au même niveau que les autres. L'onglet « Installation » est
désormais un lien affiché avec « Projets » sur l'écran racine (plus besoin d'ouvrir un projet
pour y accéder) ; l'écran projet n'a plus qu'un lien de retour. `.nav` est en `position: sticky`
avec un fond opaque (`--color-bg`). `tsc --noEmit` passe sans erreur.

**Vous** — 13/08 09:54
Retire la en sticky, elle m'embete un peu car lorsque j'ouvre les modals (cartes) il me cache une partie de la carte.

**Vous** — 13/08 09:58
De plus j'aimerais que la barre de navigation integre également lucid icons. Par exemple a coter de "projets"

**Vous** — 13/08 10:11
En haut a droite, la ou il y a écrit le projet, j'aimerais qu'il devienne un dropdown pour changer de projet. La lsite peut etre longue donc ajoute une barre de recherche (dans la page de liste de projet également) et adapte bien la liste visuellement.

**Assistant IA** — 2026-08-13 15:38
Trois correctifs appliqués. `position: sticky` retiré de `.nav` (redevient un flux normal, ne
recouvre plus les modals). Icônes Lucide ajoutées à côté de chaque lien de nav (`ProjectsIcon`,
`SettingsIcon`, `ArrowLeftIcon` pour le retour). En haut à droite du tableau, le nom du projet
est remplacé par un nouveau composant `ProjectSwitcher.tsx` : bouton + chevron qui ouvre un
panneau avec barre de recherche et liste filtrée de tous les projets (tous roots confondus),
fermeture au clic extérieur ou à Échap, sélection change directement de projet. Une barre de
recherche équivalente a été ajoutée sur `RootScreen.tsx` pour filtrer la grille de projets.
`tsc --noEmit` et les tests (17/17) passent.

**Vous** — 13/08 10:31
Le dropdown pour changer de projet est un peu transparent j'aimerais qu'il ait pleine opacité.

**Assistant IA** — 2026-08-13 16:17
`ProjectSwitcher.tsx` : fond du panneau passé de `var(--color-bg)` (couleur de fond de page —
donnait une impression de transparence puisque c'est la même couleur que ce qu'il y a derrière)
à `var(--color-surface)` (couleur des panneaux élevés, comme les dialogs), avec une ombre
`var(--shadow-lg)` pour bien le détacher visuellement. `tsc --noEmit` et les tests (17/17)
passent.

**Vous** — 13/08 11:03
Le dropdown de selection de projet est toujours transparent. la barre de navgation peut tenir le choix de priorité.

**Assistant IA** — 2026-08-13 16:48
Vraie cause de la transparence trouvée : `Nav.tsx` enveloppait le slot `right` dans un `<span
style={{ opacity: 0.6 }}>` — pensé à l'origine pour un simple texte muet (nom du projet), mais
qui rendait translucide tout ce qu'il contenait, y compris le panneau du `ProjectSwitcher` une
fois devenu interactif. `background: var(--color-surface)` était donc déjà correct, mais écrasé
par l'opacité du parent. `opacity: 0.6` retiré du wrapper `right` dans `Nav.tsx`.

Priorité déplacée dans la nav : `BoardScreen.tsx` place maintenant le `<select>` de priorité
dans le slot `right` de la nav quand une carte est ouverte (à la place du `ProjectSwitcher`,
masqué pendant ce temps) ; `CardPage.tsx` ne l'affiche plus dans son propre corps. `tsc
--noEmit` et les tests (16/16) passent.
