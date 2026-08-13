---
name: codekanban
description: Lecture et écriture du backlog de tâches CodeKanban — fichiers Markdown dans .taskboard/ à la racine d'un projet, sans MCP. Utiliser quand un repo contient un dossier .taskboard/, quand l'utilisateur demande de regarder les tâches à faire/en cours/bloquées, ou quand il demande d'affiner une carte backlog. Triggers: "tâches en attente", "regarde le tableau", "CodeKanban", ".taskboard", "affine la carte", "affinage du prompt".
---

# CodeKanban — backlog de tâches en fichiers Markdown

CodeKanban est un client desktop (Electron) qui remplace Trello : plus d'appel MCP, les tâches
sont des fichiers `.md` dans `.taskboard/` à la racine du dépôt du projet. Tu lis/écris ces
fichiers directement — aucune API, aucune connexion réseau.

## Détection

Ce skill s'applique dès que le repo courant contient un dossier `.taskboard/` à sa racine.

## Structure sur disque

```
.taskboard/
  001-ajouter-authentification-oauth.md
  002-corriger-bug-pagination-admin.md
  archive/2026-08-11/...          # cartes validées, archivées automatiquement par jour
```

## Format d'une carte

Frontmatter YAML + corps Markdown en trois sections fixes :

```markdown
---
id: "004"
status: todo
priority: moyenne
estimate: "~30 min"
order: 10
wi: null
depends_on: []
ask_user_questions: null
refined: false
created: "2026-08-11T10:00:00"
updated: "2026-08-11T10:00:00"
validated_at: null
---
# Corriger le bug de pagination sur /admin

## Description
Texte libre / prompt pour l'IA.

## Checklist
- [ ] Reproduire le bug
- [x] Corriger le calcul du nombre de pages

## Commentaires
**Vous** — 2026-08-11 14:32
Texte du commentaire / correction demandée.

**Assistant IA** — 2026-08-11 15:00
Rapport de ce qui a été fait, ou raison du blocage.
```

## Les 6 statuts

| status | colonne | qui la déplace |
|---|---|---|
| `backlog` | Backlog | utilisateur uniquement — **jamais lue ni modifiée par l'IA** |
| `todo` | À faire | l'IA peut la prendre |
| `doing` | En cours | l'IA, quand elle démarre le travail |
| `blocked` | Bloqué | l'IA, si elle rencontre un blocage — reprise **manuelle** par l'utilisateur vers `todo` |
| `done` | Terminé | l'IA, quand le travail + les tests passent |
| `validated` | Validé | utilisateur uniquement — **jamais écrite par l'IA** ; archivée chaque jour |

## Règles de lecture

- Ignore entièrement `backlog` et `validated`, **sauf** demande explicite d'affinage sur une
  carte backlog précise — voir `## Mode affinage du prompt (carte backlog)`.
- Quand plusieurs cartes sont à prendre dans `todo`, traite-les dans l'ordre **croissant du
  champ `order`** (l'ordre visuel de la colonne, celui piloté par le glisser-déposer), **pas**
  dans l'ordre des identifiants de fichier. Une carte glissée au-dessus d'une autre doit être
  traitée avant, même si son `id` est plus grand.
- Champ `depends_on` (liste d'`id` de cartes du même projet, optionnel) : une carte listée en
  dépendance doit être traitée avant celle qui la référence. Si une dépendance est encore en
  `todo`/`doing`/`blocked` (pas encore `done`/`validated`), ne prends pas la carte dépendante —
  laisse-la en `todo` et traite d'abord ses dépendances.
- Champ `skills` (liste de noms de skills, optionnel) : avant de traiter la carte, charge et
  applique chacun des skills listés en complément de celui-ci — ce n'est pas une simple
  étiquette informative, c'est une instruction. Ex. `skills: [manager]` → suis aussi les
  instructions du skill `manager` (protocole de mémoire/resumabilité) en plus du format de carte
  régi par `codekanban`. Si un skill listé n'est pas installé/disponible, mentionne-le dans ton
  rapport en `## Commentaires` plutôt que de l'ignorer silencieusement.
- Champ `ask_user_questions` (`true` / `false` / `null`) : contrôle si tu es autorisé à
  interrompre le traitement de cette carte pour poser des questions de clarification (outil
  `AskUserQuestion`) — aussi bien pour exécuter le prompt de la `## Description` que pour
  traiter un nouveau commentaire. `true` = autorisé explicitement sur cette carte, `false` =
  interdit explicitement (fais les choix toi-même, ou passe en `blocked` si un choix est
  réellement bloquant), `null`/absent = suit le réglage par défaut du projet (page
  Configuration de l'app, hors du fichier de carte).
- Avant de démarrer une carte `todo`/`doing`/`blocked`, lis-la en entier, y compris tous les
  commentaires : un commentaire peut signaler une correction demandée suite à un rapport
  précédent, ou la réponse de l'utilisateur à un blocage.
- Ne touche jamais à une carte que tu n'es pas en train de traiter.

## Règles d'écriture

1. Quand tu prends une carte en `todo`, passe `status: doing`.
2. Coche les éléments de la `## Checklist` au fur et à mesure de leur avancement **réel**, jamais
   par anticipation.
3. Ajoute une entrée dans `## Commentaires` (format `**Assistant IA** — <date> <heure>` suivi du
   texte) à chaque rapport, réponse, ou signalement de blocage — plutôt que de deviner en silence
   sur un point incertain.
4. Si tu es bloqué (choix incertain, dépendance manquante, décision qui dépasse le scope de la
   carte), passe `status: blocked` avec un commentaire expliquant précisément le blocage. Tu ne
   reprendras cette carte que lorsque l'utilisateur l'aura repassée en `todo`.
5. Une fois le travail terminé et les tests passés, passe `status: done` avec un commentaire de
   rapport.
6. Ne passe **jamais** toi-même une carte à `status: validated` — c'est réservé à l'utilisateur.

## Mode affinage du prompt (carte backlog)

Exception ciblée à la règle « ignore `backlog` » : uniquement quand l'utilisateur te demande
explicitement d'affiner une carte backlog précise (ex. « affine la carte 007 », « on affine le
prompt de la tâche X »). Sans demande explicite et sans carte identifiée sans ambiguïté, `backlog`
reste entièrement ignoré comme d'habitude — si plusieurs cartes backlog pourraient correspondre,
demande à l'utilisateur de préciser plutôt que de deviner.

Déroulé :

1. Lis la carte visée en entier (description, checklist, commentaires existants) pour comprendre
   le point de départ.
2. Dialogue avec l'utilisateur pour affiner l'implémentation ou la correction attendue : pose des
   questions ciblées (via `AskUserQuestion` si l'outil est disponible) jusqu'à obtenir une
   spécification actionnable — choix d'implémentation, périmètre, cas limites, contraintes.
3. Une fois l'affinage terminé, réécris directement la section `## Description` de la carte avec
   le résultat final synthétisé (le prompt affiné, prêt à être exécuté tel quel par une IA plus
   tard), pose ou mets à jour la `## Checklist` en conséquence, et pose `refined: true` en
   frontmatter (indique dans l'app qu'un ✨ « prompt affiné » doit s'afficher sur la carte).
4. Ne consigne pas l'échange de questions/réponses dans `## Commentaires` — seul le résultat final
   affiné compte, dans la Description.
5. Ne touche jamais à `status` (la carte reste en `backlog`) ni à `wi` pendant ce mode : c'est à
   l'utilisateur de décider quand la carte affinée passe en `todo`.
6. Si la Description d'une carte déjà `refined: true` est modifiée manuellement par
   l'utilisateur dans l'app, `refined` repasse automatiquement à `false` côté app — tu n'as rien
   à faire pour ça, mais ne repose jamais `refined: true` toi-même en dehors de ce mode
   affinage.
