---
id: '002'
status: validated
priority: moyenne
estimate: ''
order: 10
wi: null
skills: []
created: '2026-08-12T16:37:16.721Z'
updated: '2026-08-12T17:22:26.736Z'
validated_at: null
---
# Pouvoir choisir le skill

## Description
Ajouter un champ `skills` sur chaque carte : une liste de tags (0, 1 ou plusieurs) indiquant quel(s) skill(s) IA la carte requiert. Champ purement informatif — pas de filtrage/tri du tableau par skill dans cette carte.

Détails d'implémentation :
- **Frontmatter** : nouveau champ `skills: string[]` (défaut `[]`) dans `electron/lib/cardFile.cjs` — le lire dans `parseCardFile` (`data.skills`, fallback `[]` si absent/invalide) et l'écrire dans `serializeCard`.
- **Source de la liste de skills disponibles** : scanner les sous-dossiers de `~/.claude/skills/` (chaque dossier contenant un `SKILL.md` = un skill disponible, nom = nom du dossier). Ajouter un nouveau module IPC, ex. `electron/ipc/skills-catalog.cjs`, avec un handler (ex. `skills:list`) qui retourne la liste des noms de dossiers trouvés. L'exposer dans `electron/preload.cjs` (ex. `listAvailableSkills: () => ipcRenderer.invoke('skills:list')`) et dans le type `CodeKanbanApi` (`src/types.ts`).
- **Type carte** : ajouter `skills: string[]` au type `Card` (ou équivalent) dans `src/types.ts`.
- **UI carte Kanban** : afficher un ou plusieurs petits badges/chips (un par skill) sur la vignette de la carte dans la colonne, à côté des autres métadonnées existantes (priorité, estimate, etc.).
- **UI détail de carte** : dans la vue détail/édition de la carte, ajouter un champ multi-select (ex. combobox à tags) permettant d'ajouter/retirer des skills parmi la liste retournée par `skills:list`, avec possibilité de saisir un nom qui n'existe pas encore localement (pas de blocage si le dossier skill n'existe pas sur la machine — juste informatif).
- Persister la modification via le mécanisme d'écriture de carte existant (même flux que les autres champs édités en détail de carte).

## Checklist
- [x] Ajouter le champ `skills` (lecture/écriture) dans `electron/lib/cardFile.cjs`
- [x] Créer le handler IPC `skills:list` scannant `~/.claude/skills/`
- [x] Exposer `listAvailableSkills` dans `electron/preload.cjs` et `src/types.ts`
- [x] Ajouter `skills: string[]` au type `Card` dans `src/types.ts`
- [x] Afficher les badges skill sur la vignette de carte dans la colonne Kanban
- [x] Ajouter le sélecteur multi-tags dans la vue détail de carte
- [x] Vérifier la persistance (ajout/suppression de skill, rechargement de la carte)

## Commentaires
**Assistant IA** — 2026-08-12 17:16
Implémenté : champ `skills: string[]` lu/écrit dans `electron/lib/cardFile.cjs` (défaut `[]`), valeur par défaut ajoutée à la création de carte (`electron/ipc/cards.cjs`). Nouveau module `electron/ipc/skills-catalog.cjs` (`skills:list`) qui scanne `~/.claude/skills/`, en résolvant correctement les symlinks (dont un cas de symlink cassé rencontré sur cette machine — ignoré sans planter). Exposé via `preload.cjs` (`listAvailableSkills`) et `types.ts`.

Côté UI : nouveau composant `src/components/SkillTags.tsx` avec `SkillBadges` (badges lecture, utilisés dans `CardItem.tsx` sous l'estimate) et `SkillTagsEditor` (chips + input avec suggestions `<datalist>` des skills installés localement, ajout libre au clavier même si le skill n'existe pas sur la machine). Intégré dans `CardModal.tsx` au-dessus de la Checklist.

Vérifié : `tsc --noEmit` et `npm run build` passent. Ajout de deux tests dans `CardModal.test.tsx` (ajout d'un skill via Entrée, suppression via le bouton ×) confirmant la persistance par `onChange` — suite complète : 17/17 tests verts. Scan `skills:list` vérifié directement contre le vrai `~/.claude/skills/` de la machine (retourne bien `codekanban`, `glpi`, `ipeos-manager`).
