---
name: codekanban
description: Lecture et écriture du backlog de tâches CodeKanban — fichiers Markdown dans .taskboard/ à la racine d'un projet, sans MCP. Utiliser quand un repo contient un dossier .taskboard/, quand l'utilisateur demande de regarder les tâches à faire/en cours/bloquées, quand il demande d'affiner une carte backlog, ou quand ipeos-manager redirige ici pour le format des cartes. Triggers: "tâches en attente", "regarde le tableau", "CodeKanban", ".taskboard", "affine la carte", "affinage du prompt".
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
- Avant de démarrer une carte `todo`/`doing`/`blocked`, lis-la en entier, y compris tous les
  commentaires : un commentaire peut signaler une correction demandée suite à un rapport
  précédent, ou la réponse de l'utilisateur à un blocage.
- Ne touche jamais à une carte que tu n'es pas en train de traiter.

## Règles d'écriture

1. Quand tu prends une carte en `todo`, passe `status: doing`.
2. Si tu travailles sous le protocole `ipeos-manager` (réservation de Work Item), pose le champ
   `wi:` avec l'ID du WI réservé pour cette carte — prendre une carte revient à ouvrir un WI.
3. Coche les éléments de la `## Checklist` au fur et à mesure de leur avancement **réel**, jamais
   par anticipation.
4. Ajoute une entrée dans `## Commentaires` (format `**Assistant IA** — <date> <heure>` suivi du
   texte) à chaque rapport, réponse, ou signalement de blocage — plutôt que de deviner en silence
   sur un point incertain.
5. Si tu es bloqué (choix incertain, dépendance manquante, décision qui dépasse le scope de la
   carte), passe `status: blocked` avec un commentaire expliquant précisément le blocage. Tu ne
   reprendras cette carte que lorsque l'utilisateur l'aura repassée en `todo`.
6. Une fois le travail terminé et les tests passés, passe `status: done` avec un commentaire de
   rapport.
7. Ne passe **jamais** toi-même une carte à `status: validated` — c'est réservé à l'utilisateur.

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
   tard) et pose ou mets à jour la `## Checklist` en conséquence.
4. Ne consigne pas l'échange de questions/réponses dans `## Commentaires` — seul le résultat final
   affiné compte, dans la Description.
5. Ne touche jamais à `status` (la carte reste en `backlog`) ni à `wi` pendant ce mode : c'est à
   l'utilisateur de décider quand la carte affinée passe en `todo`.

## Lien avec ipeos-manager

Si `ai_memory/`, `STACK_SPEC.md` ou `AGENTS.md` sont aussi présents dans ce repo, charge et suis
le protocole `ipeos-manager` en parallèle : ce skill régit le format des cartes, `ipeos-manager`
régit la mémoire/resumabilité et la réservation des Work Items. Un WI ouvert pour une carte doit
avoir son ID posé dans le champ `wi:` de cette carte.
