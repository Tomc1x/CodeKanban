---
id: '001'
status: validated
priority: moyenne
estimate: ''
order: 20
wi: null
skills: []
created: '2026-08-12T16:35:14.637Z'
updated: '2026-08-12T17:22:26.737Z'
validated_at: null
---
# Barre du haut

## Description
Remplacer la barre de titre native de l'app Electron (Windows/Linux uniquement, pas de build macOS) par une barre custom intégrée au thème de l'app.

Comportement attendu :
- Supprimer complètement le menu applicatif natif (File/Edit/View/...) via `Menu.setApplicationMenu(null)` dans `electron/main.cjs` — aucun accès résiduel (ni via Alt, ni raccourci).
- Retirer le frame natif de la fenêtre (`frame: false` dans les options de `BrowserWindow` de `createWindow()` dans `electron/main.cjs`).
- Créer une barre de titre custom en HTML/CSS/React (nouveau composant, ex. `src/components/TitleBar.tsx`), fixée en haut de l'app, stylée pour suivre le thème clair/sombre existant de l'app.
- La barre affiche à gauche le nom de l'app ("CodeKanban") + l'icône de l'app.
- Toute la zone de la barre (sauf les 3 boutons à droite) doit être une zone de drag pour déplacer la fenêtre (CSS `-webkit-app-region: drag`, et `-webkit-app-region: no-drag` sur les boutons).
- À droite, 3 boutons de contrôle : Minimiser, Maximiser/Restaurer (icône qui change selon l'état de la fenêtre), Fermer.
- Ces boutons communiquent avec le process principal via IPC (nouveaux canaux dans `electron/preload.cjs` + un handler, ex. `electron/ipc/window.cjs`, exposant `window:minimize`, `window:maximize`, `window:close`, et un événement/état pour savoir si la fenêtre est maximisée afin de basculer l'icône Maximiser/Restaurer).
- Double-clic sur la zone de drag doit aussi maximiser/restaurer la fenêtre (comportement standard Windows).

## Checklist
- [x] Retirer le menu applicatif natif (`Menu.setApplicationMenu(null)`)
- [x] Passer `frame: false` sur la `BrowserWindow`
- [x] Ajouter les handlers IPC fenêtre (minimize/maximize/close + état maximisé) côté main + preload
- [x] Créer le composant `TitleBar` (nom app + icône, zone de drag, 3 boutons)
- [x] Gérer le changement d'icône Maximiser/Restaurer selon l'état de la fenêtre
- [x] Gérer le double-clic sur la zone de drag pour maximiser/restaurer
- [x] Vérifier le rendu en thème clair et sombre
- [ ] Tester sur Windows et Linux

## Commentaires
**Assistant IA** — 2026-08-12 17:10
Implémenté : menu natif supprimé (`Menu.setApplicationMenu(null)`), `frame: false` sur la `BrowserWindow`, handlers IPC dans `electron/ipc/window.cjs` (minimize/maximizeToggle/close/isMaximized + event `window:maximizedChanged`), exposés dans `preload.cjs` et `types.ts`. Nouveau composant `src/components/TitleBar.tsx` monté dans `App.tsx`, avec icônes dédiées (`MinimizeIcon`/`MaximizeIcon`/`RestoreIcon`/`CloseIcon`) et styles `.title-bar*` dans `styles.css` suivant les tokens clair/sombre existants.

Vérifié visuellement (capture d'écran hors-écran via `capturePage`, sans passer par le vrai bureau) en thème clair et sombre : plus de menu File/Edit/View, barre custom avec marque "CodeKanban", drag zone, 3 boutons. Testé fonctionnellement : `win.maximize()` → icône bascule en Restaurer ; double-clic sur la zone de drag restaure bien la fenêtre maximisée ; clic sur le bouton Minimiser minimise réellement la fenêtre (`win.isMinimized() === true`). `npm run build`, `tsc --noEmit` et la suite de tests (`vitest run`, 15/15) passent.

Non testé : build réel sur Windows (pas d'environnement Windows disponible ici) — seul Linux a été vérifié. À valider manuellement sur Windows avant de considérer la carte comme totalement close.
