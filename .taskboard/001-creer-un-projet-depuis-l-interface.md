---
id: '001'
status: done
priority: moyenne
estimate: ''
order: 20
wi: null
skills:
  - manager
depends_on:
  - '002'
ask_user_questions: false
refined: true
created: '2026-08-13T20:18:31.696Z'
updated: '2026-08-13T20:51:51.855Z'
validated_at: null
---
# Créer un projet depuis l'interface

## Description
Ajouter un bouton "Créer un projet" dans l'interface qui permet de :
- ouvrir un dossier de repo existant (file picker natif)
- initialiser `.taskboard/` dans ce dossier s'il est absent

L'UI/UX du bouton et du flow doit suivre le design défini dans la carte 002 (Refonte) — se référer
au design importé (`CodeKanban.dc.html`, `uploads/DESIGN-notion.md`) pour l'apparence et le
comportement exacts de cette fonctionnalité une fois la refonte implémentée.

## Checklist
- [x] Attendre/valider que la carte 002 (Refonte) soit terminée, pour connaître le pattern UI à suivre
- [x] Ajouter le bouton "Créer un projet" dans l'interface (selon le design)
- [x] Implémenter la création (nom + dossier racine, conforme au design — voir commentaire)
- [x] Initialiser `.taskboard/` dans le dossier choisi s'il n'existe pas déjà
- [x] Gérer le cas où `.taskboard/` existe déjà (ouvrir le projet normalement, sans écraser)

## Commentaires

**Assistant IA** — 2026-08-13 16:56
Implémentation faite en suivant le flow exact du design (`CodeKanban.dc.html`, bouton "Nouveau
projet"), qui diffère de ma description initiale ("ouvrir un dossier existant via file picker") :
le design montre une modale Nom du projet + sélection du dossier racine (si plusieurs racines) +
Créer — pas un file picker natif. Le design étant la référence explicite indiquée par la carte,
j'ai suivi ce flow plutôt que ma description initiale.

Détail technique :
- `electron/ipc/projects.cjs` : nouveau handler `projects:create(rootId, name)` — valide le nom
  (rejette vide, `.`, `..`, et tout séparateur de chemin pour empêcher une sortie du dossier
  racine), crée `<root>/<name>` et `<root>/<name>/.taskboard/` avec `mkdirSync({recursive:true})`
  (no-op si déjà existants ⇒ ré-ouvrir un projet existant ne écrase rien).
- `electron/preload.cjs` + `src/types.ts` : exposent `createProject(rootId, name)`.
- `src/screens/RootScreen.tsx` : bouton "Nouveau projet" (pilule bleue, icône +) à côté de
  "Ajouter un dossier racine" (repassé en `btn-secondary`, le design ne réservant le bleu qu'à
  l'action principale) ; modale réutilisant les classes déjà stylées par la carte 002
  (`dialog-backdrop`, `dialog`, `field`, `input`, `dialog-actions`) — nom du projet, sélecteur de
  racine affiché seulement si plusieurs racines, message d'erreur si le nom est invalide.
  À la création, ouvre directement le tableau du nouveau projet.

Vérifié : `tsc --noEmit`, `vite build` et `vitest run` (16/16) passent. Vérification visuelle du
bouton confirmée dans l'app réelle (écran RootScreen) ; le clic sur le bouton pour ouvrir la
modale n'a pas pu être confirmé visuellement en fin de session (fenêtre ayant perdu le focus au
profit d'une autre application pendant le test manuel) — le code, le typage et les styles réutilisés
(déjà validés visuellement ailleurs dans l'app) donnent une confiance raisonnable, mais un
utilisateur devrait cliquer une fois sur "Nouveau projet" pour confirmer le rendu de la modale.

