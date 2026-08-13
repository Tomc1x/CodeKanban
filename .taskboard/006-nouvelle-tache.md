---
id: '006'
status: validated
priority: moyenne
estimate: ''
order: 10
wi: null
skills:
  - manager
depends_on: []
ask_user_questions: null
refined: false
created: '2026-08-13T13:41:48.395Z'
updated: '2026-08-13T15:48:04.343Z'
validated_at: '2026-08-13T15:48:04.343Z'
---
# Skill(s)

## Description
Mettre à jour `skill/codekanban/SKILL.md` (le fichier affiché tel quel dans l'onglet
Installation) pour qu'il ne mentionne plus `ipeos-manager` — même raison que pour le README :
CodeKanban est un repo public, `ipeos-manager` est un protocole interne à l'entreprise.

Réponse confirmée (ne pas re-vérifier) à la deuxième question : le champ `skills` d'une carte
n'est **jamais exécuté automatiquement**. Il n'y a aucun code, ni dans `electron/`
(`electron/lib/cardFile.cjs` le lit/écrit comme un simple tableau de chaînes) ni dans `src/`
(`CardModal.tsx` l'édite via `SkillTagsEditor`), qui charge ou invoque un skill à partir de
cette valeur. C'est une étiquette informative pour un humain (ou une IA lisant la carte
manuellement), pas un déclencheur automatique.

À faire dans `skill/codekanban/SKILL.md` :
1. Frontmatter `description` (ligne 3) : retirer le passage « ou quand ipeos-manager redirige
   ici pour le format des cartes ».
2. `## Règles d'écriture`, point 2 (ligne 81-82) : retirer l'instruction liée au protocole
   `ipeos-manager` sur le champ `wi`, et renuméroter les points suivants.
3. Supprimer entièrement la section `## Lien avec ipeos-manager` (lignes 118-123).
4. Vérifier qu'aucune autre occurrence d'`ipeos-manager` ne subsiste dans le fichier.

## Checklist
- [x] Retirer la mention ipeos-manager du frontmatter `description`
- [x] Retirer l'instruction ipeos-manager du point 2 des règles d'écriture (renumérotation)
- [x] Supprimer la section « Lien avec ipeos-manager »
- [x] Vérifier l'absence de toute autre occurrence d'ipeos-manager dans le fichier

## Commentaires
**Assistant IA** — 2026-08-13 15:46
`skill/codekanban/SKILL.md` : mention `ipeos-manager` retirée du frontmatter `description`,
point 2 des règles d'écriture (réservation de WI liée au protocole) supprimé et liste
renumérotée, section « Lien avec ipeos-manager » supprimée entièrement. Plus aucune occurrence
d'`ipeos-manager` dans ce fichier (vérifié par `grep`). Autres occurrences restantes dans le
repo, hors périmètre de cette carte : `CardModal.test.tsx` (donnée de test, pas de la doc) et
les cartes `.taskboard/001` / `.taskboard/006` / `.taskboard/archive/…/002` (ce sont les traces
de la discussion elle-même, à laisser telles quelles).

**Vous** — 13/08 10:42
Fait en sorte que le skill prenne en compte tout les nouveaux workflow par exemple refined je parle du skill codekanban. celui que l'on peut installer.

**Vous** — 13/08 10:48
Concernant les skills que l'on sélectionne j'ai l'impression qu'il ne sont pas exécuter, par exemple je ne retrouve pas le fonctionnement de manager quand je le selectionne

**Assistant IA** — 2026-08-13 16:15
Deux ajouts dans `skill/codekanban/SKILL.md`.

1. **Champ `skills` réellement pris en compte.** Nouvelle puce dans `## Règles de lecture` :
   avant de traiter une carte, le skill demande maintenant explicitement de charger et
   d'appliquer chaque skill listé dans `skills:` en plus de `codekanban` (ex. `skills: [manager]`
   → suivre aussi les instructions du skill `manager`). Important à comprendre : ce champ ne
   peut techniquement pas être « exécuté » par l'app elle-même (les skills Claude Code sont un
   mécanisme de chargement de prompt côté agent, pas quelque chose qu'un programme Electron peut
   déclencher) — c'est le skill `codekanban` lui-même, une fois lu par l'IA, qui doit désormais
   lui dire d'aller charger les autres skills listés. C'est donc bien exécuté, mais par l'IA qui
   lit la carte, pas par l'app.
2. **Nouveaux workflows documentés.** Le mode affinage pose maintenant `refined: true` en
   frontmatter à la fin de l'affinage (en plus de réécrire la Description), et une note précise
   que l'app remet ce champ à `false` automatiquement si la Description est modifiée
   manuellement ensuite — l'IA ne doit jamais reposer `refined: true` elle-même hors de ce mode.
   Les règles d'ordre de traitement (`order` croissant) et `depends_on` étaient déjà documentées
   depuis la carte 009.

Rien à changer côté code (`tsc`/tests non affectés, uniquement `skill/codekanban/SKILL.md`).

**Vous** — 13/08 11:44
Quand je dis /codekanban fait les tâches s'il te plait, je m'attends a ce qu'il lise les tâche qu'il voit les skills requis et qu'il les invoque pour faire les tâches, pourquoi ce n'est toujours pas fait ?
