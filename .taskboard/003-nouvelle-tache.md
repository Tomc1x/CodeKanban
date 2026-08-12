---
id: '003'
status: validated
priority: moyenne
estimate: ''
order: 30
wi: null
skills: []
created: '2026-08-12T17:40:53.997Z'
updated: '2026-08-12T19:35:21.499Z'
validated_at: null
---
# Mise à jour

## Description
L'app utilise déjà `electron-updater` (`autoUpdater.checkForUpdatesAndNotify()` au démarrage dans `electron/main.cjs`, publish GitHub configuré dans `package.json`) : ça télécharge silencieusement une mise à jour disponible et affiche une notification OS native, installée au prochain redémarrage. Objectif de cette carte : rendre ce statut visible et actionnable directement dans l'UI de l'app, plutôt que de dépendre uniquement de la notification OS.

Comportement attendu :
- **Process main (`electron/main.cjs`)** : remplacer `checkForUpdatesAndNotify()` par un pilotage manuel des événements d'`autoUpdater` (`checking-for-update`, `update-available`, `update-not-available`, `download-progress`, `update-downloaded`, `error`). Créer un nouveau module `electron/ipc/updater.cjs` qui :
  - relaie chaque événement au renderer via `webContents.send('updater:status', { state, ... })` (states : `idle`, `checking`, `available`, `downloading` avec `percent`, `downloaded` avec `version`, `not-available`, `error` avec message),
  - expose des handlers IPC `updater:check` (déclenche `autoUpdater.checkForUpdates()`) et `updater:restartAndInstall` (déclenche `autoUpdater.quitAndInstall()`).
  - Vérification automatique au démarrage (comme actuellement), puis **répétée toutes les 4h** tant que l'app tourne (`setInterval`).
- **Preload/types** : exposer `checkForUpdates()`, `restartAndInstallUpdate()`, `onUpdaterStatus(callback)` dans `preload.cjs` et `CodeKanbanApi` (`types.ts`).
- **UI — indicateur dans la `TitleBar`** : petit badge/point à côté du nom de l'app (zone `no-drag`), visible seulement quand `state !== 'idle'` :
  - `checking` : icône discrète de vérification.
  - `available` / `downloading` (avec `percent`) : indicateur de progression.
  - `downloaded` : badge accent cliquable → ouvre une popover/tooltip avec le numéro de version et un bouton **« Redémarrer maintenant »** qui appelle `restartAndInstallUpdate()`. Si l'utilisateur ne clique pas, l'installation se fait automatiquement à la prochaine fermeture normale de l'app (comportement par défaut d'`electron-updater`).
  - `error` : petit indicateur discret (pas de popup bloquante), au survol affiche le message d'erreur.
- **Vérification manuelle** : dans `InstallScreen.tsx` (ou un nouvel emplacement type "À propos"), ajouter une ligne "Mises à jour" avec le statut courant et un bouton **« Vérifier les mises à jour »** qui appelle `checkForUpdates()`.
- **Limite connue à documenter (pas à corriger dans cette carte)** : `electron-updater` ne supporte l'auto-update que pour la cible NSIS (Windows) et AppImage (Linux) — le paquet `.deb` généré par `electron-builder` (cf. `package.json` → `build.linux.target`) ne peut pas s'auto-mettre à jour ; ces utilisateurs devront retélécharger/réinstaller manuellement. Le badge de mise à jour peut être masqué silencieusement si `autoUpdater.checkForUpdates()` échoue pour cette raison (ne pas afficher d'erreur bruyante côté `.deb`).

## Checklist
- [x] Créer `electron/ipc/updater.cjs` (relai d'événements `autoUpdater` + handlers `updater:check` / `updater:restartAndInstall`)
- [x] Remplacer `checkForUpdatesAndNotify()` par le pilotage manuel dans `electron/main.cjs`, avec re-check automatique toutes les 4h
- [x] Exposer les nouvelles APIs dans `preload.cjs` et `types.ts`
- [x] Ajouter l'indicateur de statut dans `TitleBar.tsx` (checking / available / downloading avec %, downloaded avec bouton Redémarrer, error discret)
- [x] Ajouter le bouton manuel « Vérifier les mises à jour » dans `InstallScreen.tsx`
- [x] Vérifier le comportement en clair et sombre
- [x] Ignorer silencieusement l'échec d'auto-update sur la cible `.deb`

## Commentaires
**Assistant IA** — 2026-08-12 18:00
Implémenté : `electron/ipc/updater.cjs` relaie les événements `autoUpdater` (`checking-for-update`, `update-available`, `download-progress`, `update-downloaded`, `error`) vers le renderer via `updater:status`, et expose `updater:check` / `updater:restartAndInstall`. `checkForUpdatesAndNotify()` remplacé par un check au démarrage + `setInterval` toutes les 4h (`electron/main.cjs`), désactivé entièrement si `supportsAutoUpdate()` renvoie faux (Windows toujours, Linux seulement si `process.env.APPIMAGE` est défini — donc jamais pour le `.deb`, qui reçoit un état `unsupported` explicite plutôt qu'une erreur).

Côté UI : nouveau composant `TitleBar` → `UpdateIndicator` (badge discret à côté du nom de l'app, masqué si `not-available`/`unsupported`, popover avec bouton « Redémarrer maintenant » quand `downloaded`). Nouvelle section « Mises à jour » dans `InstallScreen.tsx` avec statut courant + bouton manuel « Vérifier les mises à jour ». Logique de libellé factorisée dans `src/lib/updater.ts` pour éviter la duplication entre les deux emplacements.

Vérifié par capture d'écran hors-écran (`capturePage`, sans toucher au vrai bureau) : les états checking/downloading/downloaded/error/unsupported s'affichent correctement en clair et sombre dans les deux emplacements. Un bug de positionnement de la popover (débordait hors de l'écran, ancrée `right: 0` sur un conteneur situé à gauche) a été détecté et corrigé pendant cette vérification. `tsc --noEmit`, `vitest run` (17/17) et `npm run build` passent.

Non testé en conditions réelles : un vrai cycle de mise à jour contre une release GitHub (nécessiterait de publier une version supérieure et un build packagé) — seul le flux d'événements a été simulé.

**Addendum — 2026-08-12 18:36** : confirmation en conditions réelles, et pire que prévu. L'ancienne version installée (`.deb` 0.1.0, sans le correctif ci-dessus) a auto-téléchargé et tenté d'auto-installer la release 0.2.0 via `pkexec`/`dpkg` à la fermeture de l'app — d'où le prompt « sudo » graphique signalé par l'utilisateur. Confirmé par `/var/log/dpkg.log` (`upgrade codekanban:amd64 0.1.0 0.2.0` à 14:21:37) et un fichier résiduel `~/.cache/codekanban-updater/pending/codekanban_0.2.0_amd64.deb` (supprimé). Correctif renforcé dans `electron/ipc/updater.cjs` : `autoUpdater.autoInstallOnAppQuit` n'est plus mis à `true` inconditionnellement mais suit `supportsAutoUpdate()`, et un nettoyage (`clearStalePendingUpdate()`) supprime tout résidu de mise à jour en attente au démarrage sur une installation non supportée (`.deb`), pour qu'un enregistrement laissé par un ancien build ne puisse plus jamais déclencher un install privilégié. `tsc`, `vitest` (17/17) et `npm run build` repassés verts.
