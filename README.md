# CodeKanban

Client lourd (Electron) de suivi de tâches pour Claude Code — remplace Trello + MCP. Les tâches
sont des fichiers Markdown stockés directement dans le dépôt de chaque projet
(`<projet>/.taskboard/*.md`), lus et écrits directement sur disque par l'agent : plus d'appel MCP.

## Lancer en développement

```bash
npm install
npm run dev
```

Ouvre la fenêtre Electron sur l'écran de sélection de projet. Cliquez sur "Ajouter un dossier
racine" pour indiquer un dossier parent (ex: `~/Projects`) — chacun de ses sous-dossiers apparaît
comme un projet sélectionnable.

## Format des tâches

Voir `skill/codekanban/SKILL.md` pour la spécification complète du format de fichier, des 6
statuts (backlog, à faire, en cours, bloqué, terminé, validé) et des règles de lecture/écriture
destinées à l'agent. L'onglet "Installation" de l'application affiche ce même texte avec un
bouton pour le copier.

## Installer le skill pour Claude Code

```bash
ln -s "$(pwd)/skill/codekanban" ~/.claude/skills/codekanban
```

Si vous utilisez aussi le skill `ipeos-manager`, il détecte automatiquement `.taskboard/` et
redirige vers `codekanban` pour le format des cartes (une carte prise en "À faire" = un Work Item
ouvert).

## Archivage

Les cartes passées en "Validé" sont déplacées vers `.taskboard/archive/<AAAA-MM-JJ>/` au premier
lancement de l'app suivant un changement de jour calendaire (par projet).

## Notes techniques

- `electron/` : processus principal (accès fichiers, IPC, watcher `.taskboard/`, archivage).
  Le preload n'expose qu'une API restreinte au renderer (`contextIsolation`, pas d'accès `fs`
  direct) ; tout chemin de projet est validé côté main process contre la liste des racines
  configurées.
- `src/` : renderer React/TypeScript, design system "Modernist" importé tel quel dans
  `src/styles/styles.css`.
- Le format de carte (frontmatter + sections `## Description` / `## Checklist` /
  `## Commentaires`) est géré par `electron/lib/cardFile.cjs`.
