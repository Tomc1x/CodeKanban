---
id: '010'
status: validated
priority: haute
estimate: ''
order: 20
wi: WI-20260813-MAIN-005
skills:
  - manager
depends_on: []
ask_user_questions: true
refined: false
created: '2026-08-13T15:27:44.239Z'
updated: '2026-08-13T15:53:45.525Z'
validated_at: '2026-08-13T15:53:45.524Z'
---
# Parametres

## Description
Réglage de la fréquence d'archivage automatique de la colonne « Validé » (actuellement fixe,
1×/jour) + bouton d'archivage manuel immédiat sur cette colonne.

1. **Réglage `archiveFrequency`.** Nouveau champ `archiveFrequency: 'daily' | 'weekly' | 'never'`
   dans les réglages projet (`DEFAULT_PROJECT_SETTINGS` / `projectSettings`,
   `electron/ipc/config.cjs`), valeur par défaut `'daily'` (= comportement actuel, aucun
   changement pour les projets existants qui n'ont pas encore ce champ). UI : un `<select>`
   (« Jamais » / « Quotidien » / « Hebdomadaire ») ajouté dans `InstallScreen.tsx`, à côté des
   réglages existants (Skill par défaut, AskUserQuestions), qui appelle
   `updateProjectSettings({ archiveFrequency: ... })`.
2. **`maybeArchive` respecte le réglage.** `electron/ipc/archive.cjs` doit lire
   `archiveFrequency` (via le store de `config.cjs`, côté main) avant de décider d'archiver :
   - `'never'` : n'archive jamais automatiquement (ne met plus à jour `archiveState` sur ce chemin) ;
   - `'daily'` : comportement actuel inchangé (archive si `archiveState[projectPath] !== today`) ;
   - `'weekly'` : archive seulement si au moins 7 jours se sont écoulés depuis la date stockée
     dans `archiveState[projectPath]` (comparaison de dates, pas une simple inégalité de chaînes).
3. **Bouton « Vider ».** À côté de l'en-tête de la colonne « Validé » uniquement (`Column.tsx`),
   déclenche un archivage immédiat de toutes les cartes `validated` du projet courant,
   indépendamment du réglage de fréquence :
   - nouvel IPC dédié (ex. `archive:now`, `electron/ipc/archive.cjs` + exposé dans
     `preload.cjs`) qui déplace toutes les cartes `validated` vers
     `.taskboard/archive/<date>/` puis met `archiveState[projectPath]` à aujourd'hui (pour ne pas
     redéclencher l'archivage auto juste après) ;
   - confirmation avant action (dialog simple, cohérent avec la suppression de carte), bouton
     grisé/masqué si la colonne « Validé » est déjà vide ;
   - recharge les cartes après archivage, comme les autres actions IPC.

## Checklist
- [ ] Réglage `archiveFrequency` (jamais / quotidien / hebdomadaire) dans les réglages projet + UI dans `InstallScreen.tsx`
- [ ] `maybeArchive` (`electron/ipc/archive.cjs`) respecte la fréquence choisie
- [ ] Bouton « Vider » sur la colonne « Validé » : archive immédiatement (IPC dédié + confirmation), masqué si colonne vide

## Commentaires
**Assistant IA** — 2026-08-13 17:55
Trois volets traités (WI-20260813-MAIN-005).

1. **Réglage `archiveFrequency`.** Ajouté à `DEFAULT_PROJECT_SETTINGS` (`electron/ipc/config.cjs`,
   défaut `'daily'` = comportement inchangé pour les projets existants) et au type
   `ProjectSettings` (`src/types.ts`). `<select>` (Jamais / Quotidien / Hebdomadaire) ajouté dans
   `InstallScreen.tsx`, sous le réglage AskUserQuestions.
2. **`maybeArchive` respecte la fréquence.** `electron/ipc/archive.cjs` réécrit : lit
   `archiveFrequency` via le store avant de décider — `never` n'archive jamais automatiquement,
   `daily` garde le comportement d'origine, `weekly` compare la date stockée dans `archiveState`
   à aujourd'hui (`daysSince >= 7`) plutôt qu'une simple inégalité de date.
3. **Bouton « Vider ».** Icône poubelle ajoutée dans l'en-tête de la colonne « Validé »
   uniquement (`Column.tsx`, nouvelle prop `onArchiveAll`, visible seulement si la colonne
   contient au moins une carte). Nouvel IPC `archive:now` (`cards.cjs` + `preload.cjs`) qui
   appelle la nouvelle fonction `archiveNow()` (`archive.cjs`, factorisée avec `maybeArchive` via
   `moveValidatedToArchive`) : archive immédiatement, indépendamment du réglage de fréquence, et
   met à jour `archiveState` pour ne pas redéclencher l'auto-archivage juste après. Confirmation
   via une modale interne React (`confirmArchiveAll` dans `BoardScreen.tsx`, même pattern que la
   suppression de carte) — **pas** de `window.confirm` (cf. `ai_rules/pitfalls.md#pit-001`, la
   carte 002 avait montré que les dialogues natifs cassent le focus Electron).

`tsc --noEmit` et les tests (16/16) passent. Non vérifié visuellement dans l'app (pas d'accès
navigateur dans cette session).

**Vous** — 13/08 11:46
Le bouton vider doit ouvrir un dialog de gestion d'erreur (etes vous sur ...)

**Assistant IA** — 2026-08-13 18:15
Vérifié : `BoardScreen.tsx` (`confirmArchiveAll`) ouvre déjà exactement ce dialog — « Vider la
colonne « Validé » » / « Archiver définitivement toutes les cartes de la colonne « Validé » ? »
avec boutons Annuler/Vider — depuis le tour précédent. Confirmé avec vous : aucun changement de
code nécessaire ici. Si le clic ne déclenchait rien lors de ton test, c'est probablement que l'app
n'avait pas encore été redémarrée depuis l'ajout de l'IPC `archive:now` dans `preload.cjs` — un
redémarrage complet (pas un simple rechargement) suffit.
