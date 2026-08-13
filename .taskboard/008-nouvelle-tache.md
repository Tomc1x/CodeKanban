---
id: 008
status: validated
priority: moyenne
estimate: ''
order: 10
wi: WI-20260813-MAIN-007
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T14:03:09.051Z'
updated: '2026-08-13T16:18:17.231Z'
validated_at: '2026-08-13T14:40:09.844Z'
---
# Parametres

## Description
Renommer l'onglet « Installation » en « Configuration » et y ajouter des réglages par projet.

Contexte : il n'existe pas de page « Paramètres » séparée aujourd'hui — le point d'entrée le
plus proche est l'onglet « Installation » (`InstallScreen.tsx`, lien dans `App.tsx`/`Nav.tsx`
sur l'écran racine depuis la carte 002). C'est cet onglet qui devient « Configuration » : le
contenu actuel (installation/mise à jour du skill `codekanban`) est conservé, on y ajoute une
nouvelle section de réglages par projet.

1. Renommer le lien de nav « Installation » → « Configuration » dans `App.tsx`, et le titre
   `<h1>` dans `InstallScreen.tsx` (ou renommer le composant si jugé plus propre).
2. Ajouter une section « Réglages du projet » dans cet écran, avec un sélecteur de projet (ou
   accessible depuis le contexte projet déjà ouvert) contenant :
   - **Skill par défaut** : liste déroulante alimentée par `window.api.listAvailableSkills()`
     (déjà exposé), sélection appliquée automatiquement au champ `skills` de toute nouvelle
     carte créée dans ce projet (`createCard`), reste librement modifiable/retirable ensuite
     dans `CardModal.tsx` comme aujourd'hui.
   - **AskUserQuestions par défaut** : switch on/off, valeur par défaut appliquée à toute
     nouvelle carte du projet quand son champ `ask_user_questions` (carte 007) est `null`
     (non surchargé). Recherche l'IA lors du traitement d'une carte : `ask_user_questions` de
     la carte prime, sinon ce réglage projet s'applique.
3. Stockage : ces réglages sont par projet, donc à ranger côté Electron dans le store
   `electron-store` existant (`electron/ipc/config.cjs`), sur le même principe que
   `archiveState` — une clé `projectSettings` indexée par `project.path`
   (`{ defaultSkill: string | null, askUserQuestionsDefault: boolean }`), avec des handlers IPC
   dédiés (`config:getProjectSettings` / `config:setProjectSettings`) exposés dans `preload.cjs`
   et le type `CodeKanbanApi`.

## Checklist
- [x] Renommer l'onglet/page « Installation » en « Configuration »
- [x] Section réglages par projet : skill par défaut (dropdown depuis `listAvailableSkills`)
- [x] Section réglages par projet : switch AskUserQuestions par défaut
- [x] Stockage électron-store `projectSettings` par `project.path` + IPC dédiés
- [x] Application du skill par défaut à la création d'une carte dans ce projet

## Commentaires
**Assistant IA** — 2026-08-13 15:32
Lien de nav et `<h1>` renommés en « Configuration ». Store `electron-store` : nouvelle clé
`projectSettings` (indexée par `project.path`, défauts `{ defaultSkill: null,
askUserQuestionsDefault: true }`) + handlers IPC `config:getProjectSettings` /
`config:setProjectSettings` (`electron/ipc/config.cjs`), exposés via `preload.cjs` et typés dans
`CodeKanbanApi` (`src/types.ts`). `InstallScreen.tsx` affiche une section « Réglages du projet »
avec sélecteur de projet, dropdown de skill par défaut et switch AskUserQuestions, persistés à
chaque changement. `cards:create` (`electron/ipc/cards.cjs`) applique désormais
`projectSettings[projectPath].defaultSkill` au champ `skills` d'une carte nouvellement créée.
Le champ `ask_user_questions` par carte (surcharge, carte 007) n'existe pas encore — ce réglage
projet sert de valeur par défaut quand il sera ajouté. `tsc --noEmit` et les tests (17/17)
passent.

**Vous** — 13/08 11:59
Quand j'appuis sur le bouton vider, il ne se passe rien

**Assistant IA** — 2026-08-13 19:00
Cause probable trouvée (WI-20260813-MAIN-007) : l'appel `window.api.archiveNow(project.path)`
dans `BoardScreen.tsx` n'avait pas de gestion d'échec — si l'IPC rejetait (ex. erreur fichier,
chemin non reconnu), rien ne s'affichait, exactement le symptôme « il ne se passe rien » déjà
signalé sur la carte 010. Corrigé : `.then()/.catch()/.finally()` complets sur cet appel, un état
`archiving` désactive les boutons et affiche « Archivage… » pendant l'opération, et en cas
d'échec une nouvelle modale d'erreur interne (jamais `window.confirm`/`alert`, cf.
`ai_rules/pitfalls.md#pit-001`) affiche le message d'erreur au lieu de rester silencieuse.

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session) : si le bouton reste silencieux même après ce correctif et un
redémarrage complet de l'app, la nouvelle modale d'erreur affichera enfin le message exact —
peux-tu la copier-coller si le problème persiste ?
