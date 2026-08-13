---
id: '013'
status: validated
priority: basse
estimate: ''
order: 20
wi: null
skills:
  - ipeos-manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T16:34:08.622Z'
updated: '2026-08-13T20:18:28.450Z'
validated_at: null
---
# Toast Notifications

## Description
Ajouter un système de toast notifications éphémères dans l'app pour donner un retour visuel immédiat sur les actions du board, sans système de toast existant à réutiliser (aucun composant `Toast` trouvé dans `src/`).

**Événements déclencheurs :**
- Changement de statut d'une carte (déplacement entre colonnes, manuel ou déclenché par l'IA via modification du fichier `.md`) : `todo` ↔ `doing` ↔ `blocked` ↔ `done`, etc.
- Création d'une carte
- Suppression d'une carte
- Archivage (bouton "Vider" sur la colonne `validated`, ou archivage automatique quotidien)

**Contenu du toast :**
- Changement de statut : titre de la carte + transition `ancien statut → nouveau statut` en libellés français des colonnes (ex: "Corriger le bug pagination : À faire → En cours").
- Création : titre de la carte créée (ex: "Carte créée : Corriger le bug pagination").
- Suppression : titre de la carte supprimée (ex: "Carte supprimée : Corriger le bug pagination").
- Archivage : nombre de cartes archivées (ex: "3 cartes archivées").

**Style et comportement :**
- Position : bas-droite de la fenêtre.
- Durée d'affichage : 3 secondes, puis disparition (fade-out).
- Plusieurs toasts simultanés s'empilent verticalement, 3 à 4 maximum visibles à la fois ; au-delà, les plus anciens sont écartés (retirés de la pile) pour laisser la place aux nouveaux.
- Toast non bloquant : ne doit pas intercepter le focus ni empêcher d'interagir avec le board en dessous.
- Cohérent avec le thème visuel actuel de l'app (clair/sombre si l'app le supporte déjà).

**Implémentation suggérée :**
- Un composant `Toast`/`ToastStack` + un contexte ou store léger (ex: hook `useToasts`) pour empiler/dépiler les notifications depuis n'importe quel point de l'app (actions utilisateur dans `BoardScreen`/`Column`, et rechargement après modification de fichier `.md` détectée par le watcher, le cas échéant).
- Détecter les changements de statut déclenchés par l'IA (édition externe du fichier `.md` pendant que l'app tourne) via le mécanisme de watch/reload existant, pas seulement les actions UI directes, pour couvrir aussi ce cas.

## Checklist
- [x] Tester avec plusieurs événements rapprochés (empilement correct)

## Commentaires
**Assistant IA** — 2026-08-13 12:45
Fait. Ajout de `src/lib/toast.tsx` (ToastProvider/useToast, pile fixe bas-droite, max 4 visibles,
auto-dismiss 3s + fade) et `src/lib/cardDiff.ts` (compare l'ancien/nouveau snapshot de cartes pour
générer les messages : création, suppression, archivage groupé, changement de statut). Branché
dans `BoardScreen.tsx` sur `loadCards`, qui est déjà appelé aussi bien après les actions UI qu'après
un événement du watcher de fichiers — ça couvre donc nativement les modifications externes du
`.md` (éditées par une IA) sans code séparé. Toasts stylés avec les tokens de thème existants
(`--color-surface`, `--color-text`, `--color-divider`), donc cohérents clair/sombre automatiquement.
`tsc --noEmit` et `npm test` passent (16/16, y compris `BoardScreen.test.tsx` mis à jour pour
englober le rendu dans `ToastProvider`). Non vérifié visuellement dans l'app Electron lancée (pas
de session graphique disponible pour ce rapport) — à confirmer à l'usage.
