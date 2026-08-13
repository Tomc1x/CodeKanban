---
id: '012'
status: validated
priority: haute
estimate: ''
order: 10
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T15:48:33.825Z'
updated: '2026-08-13T20:18:28.449Z'
validated_at: null
---
# Release

## Description
Deux volets : un correctif de navigation dans la page carte, puis une release du projet en
suivant le pipeline existant.

1. **Retour au kanban après Valider/Relancer.** Dans `CardPage.tsx`, les boutons « Valider »
   (statut → `validated`, barre d'actions du bas, visible quand `card.status === 'done'`) et
   « Relancer » (statut → `todo`, zone commentaires, visible quand le dernier commentaire est de
   l'utilisateur) appellent aujourd'hui directement `onChange({ ...card, status: ... })` sans
   quitter la page carte. Après ce changement de statut, ramener au tableau comme le fait déjà le
   bouton « Fermer »/la touche Échap (`window.history.back()`).
2. **Release.** Une fois le correctif ci-dessus fait et vérifié (`tsc --noEmit` + `npm test`),
   suivre le pipeline déjà en place dans ce repo (`package.json` scripts `dist`/`release`,
   `.github/workflows/release.yml`, `electron-builder` avec `publish: github`) :
   - bumper la version dans `package.json` (patch par défaut, sauf indication contraire au moment
     de l'exécution) ;
   - committer avec un message du type « Bump version to X.Y.Z » (cohérent avec l'historique —
     voir les commits `Bump version to 0.3.1/0.3.2/0.3.3`) ;
   - pousser sur `main` (ce dépôt n'a pas de branche `claude-develop` ni de PR intermédiaire — la
     pratique établie ici est un push direct sur `main`, contrairement à la convention par défaut
     « toujours passer par une branche ») — le push déclenche `release.yml`, qui build et publie
     la release GitHub via `electron-builder --publish always`.
   - **Le `git push` sur `main` doit être confirmé explicitement avec l'utilisateur juste avant de
     l'exécuter** (action publique et difficile à annuler une fois la release publiée) — ne pas
     l'automatiser silencieusement même si cette carte documente le processus à l'avance.

## Checklist
- [ ] Push effectué, `release.yml` déclenché

## Commentaires

