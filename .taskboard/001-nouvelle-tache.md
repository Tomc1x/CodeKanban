---
id: '001'
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
created: '2026-08-13T12:57:44.797Z'
updated: '2026-08-13T15:45:20.083Z'
validated_at: '2026-08-13T13:38:23.296Z'
---
# README

## Description
Réécrire le README pour mieux expliquer le projet, sans le confondre avec `ipeos-manager`.

Contexte confirmé (ne pas re-vérifier) : `ipeos-manager` n'est pas intégré dans le code de
l'app CodeKanban — il n'apparaît que dans la doc (`README.md`, section « Installer le skill »)
et dans le champ `skills` des cartes, qui est un tag libre parmi d'autres sans logique
spécifique dans l'app (voir `src/components/SkillTags.tsx`, `src/components/CardModal.tsx`).
Le seul skill que l'app installe/consomme réellement est `codekanban` (`skill/codekanban/`,
écran « Installation »).

À faire dans `README.md` :
1. Ajouter en tête une section « Pourquoi CodeKanban » qui explique en 3-4 phrases le problème
   résolu (remplacer Trello + appels MCP par des fichiers Markdown locaux lus/écrits
   directement par l'agent, sans API/réseau) et le fonctionnement en un coup d'œil (dossier
   `.taskboard/`, un fichier = une carte, 6 statuts, agent lit/écrit directement sur disque).
2. Clarifier la section sur `ipeos-manager` : préciser explicitement qu'il s'agit d'une
   interopérabilité optionnelle purement documentaire (aucun code de l'app n'en dépend), pour
   éviter la confusion.
3. Garder le reste de la structure existante (Lancer en développement, Format des tâches,
   Installer le skill, Archivage, Notes techniques).

## Checklist
- [x] Ajouter la section « Pourquoi CodeKanban / comment ça marche » en tête du README
- [x] Clarifier que ipeos-manager n'est qu'une doc d'interopérabilité optionnelle, non intégrée au code
- [x] Relire l'ensemble du README pour cohérence

## Commentaires
**Assistant IA** — 2026-08-13 13:40
Ajout d'une section « Pourquoi CodeKanban » en tête du README (problème résolu + fonctionnement
en un coup d'œil), et clarification explicite dans la section `ipeos-manager` : interopérabilité
purement documentaire, aucun code de l'app n'en dépend. Reste de la structure inchangée.

**Vous** — 13/08 09:38
Tu parle encore du skill ipeos-manager, c'est un repo public et ipeos-manager est interne a l'entreprise alors il n'a rien a faire dans le readme. L'utilisateur modifiera le skill selon ses envies.

**Assistant IA** — 2026-08-13 13:55
Corrigé : le paragraphe mentionnant `ipeos-manager` dans la section « Installer le skill » a été
retiré du README (repo public, `ipeos-manager` est interne à l'entreprise). Le reste de la
section (installation du skill `codekanban`) est inchangé, plus aucune occurrence d'
`ipeos-manager` dans README.md.
