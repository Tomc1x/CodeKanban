export const SKILL_TEXT = `Ce projet est piloté avec CodeKanban, un client de suivi de tâches basé sur des fichiers Markdown stockés dans le dossier du projet (.taskboard/*.md). Il n'y a aucune connexion API ni MCP : tu agis directement sur ces fichiers.

Structure attendue :
.taskboard/
  001-ajouter-authentification-oauth.md
  002-corriger-bug-pagination-admin.md
  archive/2026-08-11/...

Chaque fichier a un frontmatter YAML (id, status, priority, estimate, order, wi, created, updated, validated_at) et un corps en trois sections : "## Description", "## Checklist" ("- [ ]" / "- [x]"), "## Commentaires" (entrées "**Vous**" / "**Assistant IA**" horodatées).

Il y a 6 statuts : backlog, todo (À faire), doing (En cours), blocked (Bloqué), done (Terminé), validated (Validé).

Règles :
- Ne touche jamais aux cartes en "backlog" ou "validated" — la première est un vivier non trié par l'utilisateur, la seconde est déjà validée et en attente d'archivage.
- Avant de démarrer un travail, lis la carte en entier y compris les commentaires : un commentaire peut signaler une correction demandée suite à un rapport précédent.
- Quand tu démarres une tâche depuis "todo", passe son statut à "doing". Si tu travailles sous le protocole ipeos-manager, pose le champ "wi" avec l'ID du Work Item réservé pour cette carte.
- Coche chaque élément de la checklist au fur et à mesure de son avancement réel, jamais par anticipation.
- Si tu rencontres un blocage, fais un choix incertain, ou dois t'écarter de la demande initiale : ajoute un commentaire "**Assistant IA**" expliquant la situation et passe le statut à "blocked". Ne devine jamais en silence.
- Une fois le travail terminé ET testé, passe le statut à "done" avec un commentaire de rapport.
- Ne passe jamais toi-même une carte à "validated" — cette étape est réservée à l'utilisateur.
- Ne modifie jamais les statuts ou fichiers d'une tâche que tu n'es pas en train de traiter.`;
