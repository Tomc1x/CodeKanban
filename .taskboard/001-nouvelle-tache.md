---
id: '001'
status: validated
priority: moyenne
estimate: ''
order: 10
wi: null
created: '2026-08-11T15:39:11.527Z'
updated: '2026-08-11T16:42:52.671Z'
validated_at: null
---
# Tests et pipelines

## Description
Ecrire des tests et des piplines pour github.

## Checklist


## Commentaires
**Assistant IA** — 2026-08-11 16:15
Mis en place Vitest (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`) + `vitest.config.ts`/`vitest.setup.ts`, et un pipeline GitHub Actions `.github/workflows/ci.yml` (Node 20, sur push/PR vers `main`) qui exécute : `npm run typecheck` (tsc --noEmit), `npm test` (vitest run), puis `npm run build` (vite build).

15 tests écrits :
- `electron/lib/cardFile.test.js` — round-trip parse/serialize d'une carte (titre, description, checklist, commentaires), fallback de statut invalide vers `backlog`, fallback de titre sur le nom de fichier, et régression sur la préservation des espaces internes (titre + description) suite à la carte #002.
- `electron/ipc/cards.test.js` — `readCardsFromDisk` : dossier `.taskboard` absent, tri par `order`, ignore les fichiers non-`.md`.
- `src/lib/columns.test.ts` — ordre de la pipeline `nextColumn`, couverture des statuts, présence des classes `PRIORITY_CLASS`.
- `src/components/CardModal.test.tsx` — régression directe du bug #002 : la saisie du titre/description n'appelle plus `onChange` (donc pas d'écriture disque) à chaque frappe, seulement au blur, et les espaces internes/en bordure sont bien gérés.

Nouveaux scripts npm : `test`, `test:watch`, `typecheck`. `npm run typecheck`, `npm test` et `npm run build` passent tous localement.
